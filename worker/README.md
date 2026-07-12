# LZproxy chat worker

Backend for the "Ask LZproxy" chat widget. It proxies messages to DeepSeek
with a grounded system prompt, and gives the model two real tools so it can
check your Cal.com calendar and create actual bookings — entirely in chat,
no redirect needed.

## 1. Get a DeepSeek API key
(unchanged from before — see platform.deepseek.com)

## 2. Get a Cal.com API key

1. In Cal.com: Settings → Developer → API Keys → create one
2. Copy it (starts with `cal_live_...`)

## 3. Confirm your username and event slug

These are already prefilled in `wrangler.toml` based on your booking page
URL (`cal.com/sammi-liu-5ti03s/scoping-call`), but double check:
```toml
CAL_USERNAME = "sammi-liu-5ti03s"
CAL_EVENT_SLUG = "scoping-call"
```

## 4. Deploy

```bash
cd worker
wrangler deploy
```

## 5. Set your secrets

```bash
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put CAL_API_KEY
```

## 6. Point the chat widget at this worker

(unchanged — set `CHAT_WORKER_URL` in `src/components/ChatWidget.astro` to
the URL `wrangler deploy` gives you)

## How the booking flow works

1. Visitor says something like "I'd like to book a call"
2. The model asks what day/time range suits them
3. It calls `check_availability` — a real request to your Cal.com calendar,
   so it only ever offers times that are genuinely free
4. Once they pick a slot and give a name + email, it calls `book_meeting` —
   a real request that creates the booking, exactly like using the embedded
   calendar, so both of you get the usual Cal.com confirmation emails and
   calendar invites
5. If the slot got taken in the meantime, it re-checks and offers new times

## Testing it

After deploying, open the chat widget and try:
> "Can I book a scoping call sometime this week?"

Watch it ask a clarifying question, offer real times, then actually create
a booking once you give a name and email — check your Cal.com dashboard or
your calendar to confirm it landed.

## Cost

Same as before (DeepSeek is cheap per token) — Cal.com's API is included
free with your existing free plan, no extra cost.
