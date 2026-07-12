/**
 * LZproxy contact form backend.
 * Receives a general-inquiry submission and fans it out to:
 *   1. Resend — sends you an instant email notification
 *   2. A Google Apps Script webhook — appends a row to a Google Sheet
 *
 * Required secrets (set via `wrangler secret put`):
 *   RESEND_API_KEY
 *   SHEETS_WEBHOOK_URL   (your deployed Apps Script Web App URL)
 *
 * Required vars (in wrangler.toml [vars]):
 *   ALLOWED_ORIGIN       — your site's exact origin
 *   NOTIFY_EMAIL         — where the Resend email should be sent
 *   RESEND_FROM          — the "from" address (must be on a domain you've
 *                          verified in Resend, or their sandbox address)
 */

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const name = (body.name || '').toString().slice(0, 200);
    const business = (body.business || '').toString().slice(0, 200);
    const email = (body.email || '').toString().slice(0, 200);
    const area = (body.area || '').toString().slice(0, 200);
    const message = (body.message || '').toString().slice(0, 3000);

    if (!name.trim() || !email.trim()) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const submittedAt = new Date().toISOString();

    const tasks = [];

    // 1. Email via Resend
    if (env.RESEND_API_KEY) {
      tasks.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: env.RESEND_FROM || 'LZproxy Website <onboarding@resend.dev>',
            to: [env.NOTIFY_EMAIL],
            reply_to: email,
            subject: `New enquiry: ${name}${business ? ` (${business})` : ''}`,
            html: `
              <h2>New contact form submission</h2>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Business:</strong> ${escapeHtml(business)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Area of interest:</strong> ${escapeHtml(area)}</p>
              <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
              <p style="color:#888;font-size:12px;">Submitted ${submittedAt}</p>
            `,
          }),
        })
      );
    }

    // 2. Google Sheet via Apps Script webhook
    if (env.SHEETS_WEBHOOK_URL) {
      tasks.push(
        fetch(env.SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, business, email, area, message, submittedAt }),
        })
      );
    }

    const results = await Promise.allSettled(tasks);
    const anySucceeded = results.some((r) => r.status === 'fulfilled');

    if (!anySucceeded && tasks.length > 0) {
      console.error('All contact form deliveries failed:', results);
      return new Response(JSON.stringify({ error: 'Delivery failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  },
};
