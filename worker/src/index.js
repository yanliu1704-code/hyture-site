/**
 * LZproxy chat widget backend.
 * Proxies chat messages to DeepSeek with a grounded system prompt, AND
 * gives the model two tools so it can book real Cal.com meetings directly
 * in conversation:
 *   - check_availability: looks up real open slots on the calendar
 *   - book_meeting: creates a real booking (sends calendar invites etc.)
 *
 * Required secrets (set via `wrangler secret put`):
 *   DEEPSEEK_API_KEY
 *   CAL_API_KEY        — from Cal.com Settings → Developer → API Keys
 *
 * Required vars (in wrangler.toml [vars]):
 *   ALLOWED_ORIGIN      — your site's exact origin
 *   CAL_USERNAME        — your Cal.com username, e.g. "sammi-liu-5ti03s"
 *   CAL_EVENT_SLUG      — your event type slug, e.g. "scoping-call"
 */

const CAL_API_BASE = 'https://api.cal.com/v2';

function systemPrompt(todayIso) {
  return `You are the website assistant for LZproxy, an AI-powered "2IC" (second-in-command) business operations service for Australian small and medium businesses.

TODAY'S DATE: ${todayIso} (Australia/Sydney). Use this to resolve relative dates like "tomorrow" or "next Tuesday".

TONE: trusted, capable, quietly confident. Plain, direct sentences. Never use AI-hype language ("revolutionary", "game-changing", "supercharge", etc). Never oversell.

WHAT LZPROXY DOES: takes ownership of back-office and operational work so small business owners can focus on running the business. Every service combines AI automation with human review — AI handles the repetitive volume (document extraction, data entry, drafting, anomaly detection), and a named human reviews everything before it reaches the client.

SEVEN SERVICE AREAS (each has 3 tiers):
1. Bookkeeping & Financial Management — AP/AR, bank reconciliation, BAS/GST lodgement, on Xero/MYOB/QuickBooks.
2. Administration & Executive Support — inbox/calendar management, document prep, scheduling, travel coordination.
3. HR & Payroll — payroll processing, STP lodgement, super, Fair Work compliance, onboarding/offboarding.
4. Operations & Procurement — purchase orders, supplier management, inventory tracking.
5. Marketing — social media, content, email marketing, basic SEO, paid ads.
6. Customer Service — helpdesk, live chat, phone overflow, CRM management.
7. Systems & Project Management — system migrations, process redesign, digital transformation.

TIER STRUCTURE: L1 Core (fixed monthly subscription, cancel anytime, live in 5 business days) — L2 Advanced (monthly retainer after a scoping consult, 3-month minimum) — L3 Strategic (bespoke retainer, fractional leadership, 6-month minimum). Bundles get a 10-20% discount.

BOOKING MEETINGS — you can do this for real, directly in chat:
1. When someone wants to book a scoping call, ask what day/time range works for them (assume Australia/Sydney time unless they say otherwise).
2. Call check_availability with that date range to get REAL open slots. Never invent or guess times.
3. Present 3-5 options from the actual results, in a friendly readable format (e.g. "Tuesday 2pm" not raw ISO strings).
4. Once they pick a slot, ask for their name and email if you don't have them yet.
5. Call book_meeting with the EXACT start_time string returned by check_availability for that slot — never modify or invent a time.
6. Confirm the booking succeeded and mention they'll get a calendar invite by email.
7. If book_meeting fails (e.g. slot just got taken), apologize, call check_availability again, and offer new options.

OTHER RULES:
- Naturally qualify leads even if not booking yet: ask for name/business/email once interest is clear.
- If asked for an exact price, explain L1 is a fixed subscription but the amount depends on scope — a scoping call gives an exact number. Don't invent a dollar figure.
- If asked something outside this scope, say you'll get a human to follow up rather than guessing.
- Keep responses short — 2-4 sentences, conversational.`;
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: "Look up real open time slots on LZproxy's booking calendar for a date range. Always call this before offering times to a visitor.",
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string', description: 'Start date, format YYYY-MM-DD' },
          end_date: { type: 'string', description: 'End date, format YYYY-MM-DD (keep ranges to 7 days or less)' },
        },
        required: ['start_date', 'end_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_meeting',
      description: 'Create a real booking on the calendar. Only call this with a start_time that was returned by check_availability.',
      parameters: {
        type: 'object',
        properties: {
          start_time: { type: 'string', description: 'The exact ISO 8601 UTC time string as returned by check_availability, unmodified' },
          name: { type: 'string', description: "The attendee's full name" },
          email: { type: 'string', description: "The attendee's email address" },
          timezone: { type: 'string', description: 'IANA timezone of the attendee, e.g. Australia/Sydney. Default to Australia/Sydney if not stated.' },
        },
        required: ['start_time', 'name', 'email'],
      },
    },
  },
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

async function checkAvailability(env, args) {
  try {
    const start = `${args.start_date}T00:00:00Z`;
    const end = `${args.end_date}T23:59:59Z`;
    const url = `${CAL_API_BASE}/slots?username=${encodeURIComponent(env.CAL_USERNAME)}&eventTypeSlug=${encodeURIComponent(env.CAL_EVENT_SLUG)}&start=${start}&end=${end}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.CAL_API_KEY}`,
        'cal-api-version': '2024-09-04',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Cal.com slots error:', res.status, errText);
      return { error: 'Could not fetch availability right now.' };
    }

    const data = await res.json();
    const slotsByDate = data?.data?.slots || {};
    const flat = Object.values(slotsByDate).flat().map((s) => s.time);

    return { available_slots: flat.slice(0, 20) };
  } catch (err) {
    console.error('checkAvailability error:', err);
    return { error: 'Could not fetch availability right now.' };
  }
}

async function bookMeeting(env, args) {
  try {
    const res = await fetch(`${CAL_API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.CAL_API_KEY}`,
        'cal-api-version': '2024-08-13',
      },
      body: JSON.stringify({
        start: args.start_time,
        eventTypeSlug: env.CAL_EVENT_SLUG,
        username: env.CAL_USERNAME,
        attendee: {
          name: args.name,
          email: args.email,
          timeZone: args.timezone || 'Australia/Sydney',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Cal.com booking error:', res.status, JSON.stringify(data));
      return { success: false, error: data?.error?.message || 'That slot may no longer be available.' };
    }

    return { success: true, booking_uid: data?.data?.uid || data?.uid || null };
  } catch (err) {
    console.error('bookMeeting error:', err);
    return { success: false, error: 'Something went wrong creating the booking.' };
  }
}

async function callDeepSeek(env, messages) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      tools: TOOLS,
      temperature: 1.0,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek error ${res.status}: ${errText}`);
  }

  return res.json();
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

    const trimmedHistory = historyIn
      .slice(-6)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));

    const todayIso = new Date().toISOString().slice(0, 10);
    const messages = [
      { role: 'system', content: systemPrompt(todayIso) },
      ...trimmedHistory,
      { role: 'user', content: message },
    ];

    try {
      // Tool-calling loop: keep calling DeepSeek and executing any tool
      // calls it requests, feeding results back, until it gives a plain
      // text answer. Capped to avoid runaway loops.
      let finalReply = null;
      for (let i = 0; i < 4; i++) {
        const data = await callDeepSeek(env, messages);
        const choice = data?.choices?.[0]?.message;

        if (!choice) {
          finalReply = "Sorry, I didn't catch that — could you rephrase?";
          break;
        }

        if (choice.tool_calls && choice.tool_calls.length > 0) {
          messages.push(choice);

          for (const toolCall of choice.tool_calls) {
            let result;
            let args = {};
            try {
              args = JSON.parse(toolCall.function.arguments || '{}');
            } catch {
              args = {};
            }

            if (toolCall.function.name === 'check_availability') {
              result = await checkAvailability(env, args);
            } else if (toolCall.function.name === 'book_meeting') {
              result = await bookMeeting(env, args);
            } else {
              result = { error: 'Unknown tool' };
            }

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          }
          continue; // loop again so the model can respond to tool results
        }

        finalReply = (choice.content || '').trim() || "Sorry, I didn't catch that — could you rephrase?";
        break;
      }

      if (!finalReply) {
        finalReply = "Sorry, that took a bit long — could you try again, or book directly at /contact?";
      }

      return new Response(JSON.stringify({ reply: finalReply }), {
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
