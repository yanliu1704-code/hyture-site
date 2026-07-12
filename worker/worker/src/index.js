/**
 * LZproxy chat widget backend.
 * Proxies chat messages to DeepSeek, with a system prompt grounded in
 * LZproxy's actual service catalogue so the assistant answers FAQs and
 * qualifies leads without inventing pricing or features.
 *
 * Required secret (set via `wrangler secret put DEEPSEEK_API_KEY`):
 *   DEEPSEEK_API_KEY
 *
 * Required var (set in wrangler.toml [vars] or dashboard):
 *   ALLOWED_ORIGIN — the exact origin of your site, e.g.
 *   https://hyture-site.yanliu1704.workers.dev (no trailing slash)
 */

const SYSTEM_PROMPT = `You are the website assistant for LZproxy, an AI-powered "2IC" (second-in-command) business operations service for Australian small and medium businesses.

TONE: trusted, capable, quietly confident. Plain, direct sentences. Never use AI-hype language ("revolutionary", "game-changing", "supercharge", etc). Never oversell.

WHAT LZPROXY DOES: takes ownership of back-office and operational work so small business owners can focus on running the business. Every service combines AI automation with human review — AI handles the repetitive volume (document extraction, data entry, drafting, anomaly detection), and a named human reviews everything before it reaches the client. No unreviewed communication, financial transaction, or compliance lodgement ever goes out without human sign-off.

SEVEN SERVICE AREAS (each has 3 tiers — see below):
1. Bookkeeping & Financial Management — AP/AR, bank reconciliation, BAS/GST lodgement, on Xero/MYOB/QuickBooks.
2. Administration & Executive Support — inbox/calendar management, document prep, scheduling, travel coordination.
3. HR & Payroll — payroll processing, STP lodgement, super, Fair Work compliance, onboarding/offboarding.
4. Operations & Procurement — purchase orders, supplier management, inventory tracking.
5. Marketing — social media, content, email marketing, basic SEO, paid ads.
6. Customer Service — helpdesk, live chat, phone overflow, CRM management.
7. Systems & Project Management — system migrations, process redesign, digital transformation.

TIER STRUCTURE (applies within each area):
- L1 — Core: single well-defined task, fixed monthly subscription, cancel anytime with 30 days notice, live within 5 business days.
- L2 — Advanced: broader scope, reporting and process ownership, monthly retainer after a scoping consult, 3-month minimum.
- L3 — Strategic: fractional leadership in that area (e.g. fractional CFO, fractional HR Manager), bespoke retainer, 6-month minimum.
Bundles are available across areas with a 10-20% multi-service discount.

WHAT YOU SHOULD DO:
- Answer questions about what LZproxy does and how the tiers work using only the information above.
- Help visitors figure out which service area and tier fits their situation.
- Naturally qualify leads: once there's real interest, ask for their name, business name, and email so a human can follow up — don't interrogate, just ask once, conversationally.
- If asked for an exact price, explain that L1 is a fixed monthly subscription but the amount depends on volume/scope, and a scoping call gives an exact number — don't invent a dollar figure.
- If asked something outside this scope (unrelated topics, technical support for other products, anything you're unsure of), say you'll get a human to follow up rather than guessing.
- Keep responses short — 2-4 sentences, conversational, not a bulleted essay.`;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
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

    const message = (body?.message ?? '').toString().slice(0, 800);
    const historyIn = Array.isArray(body?.history) ? body.history : [];

    if (!message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    // Keep only the last 6 turns of history, and only role/content fields
    const trimmedHistory = historyIn
      .slice(-6)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmedHistory,
      { role: 'user', content: message },
    ];

    try {
      const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages,
          temperature: 1.0,
          max_tokens: 300,
        }),
      });

      if (!dsResponse.ok) {
        const errText = await dsResponse.text();
        console.error('DeepSeek error:', dsResponse.status, errText);
        return new Response(
          JSON.stringify({ reply: "Sorry, I'm having trouble right now — a scoping call is the fastest way to get an answer: /contact" }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      const data = await dsResponse.json();
      const reply = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I didn't catch that — could you rephrase?";

      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(
        JSON.stringify({ reply: "Sorry, something went wrong. Please try again shortly, or book a scoping call: /contact" }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }
  },
};
