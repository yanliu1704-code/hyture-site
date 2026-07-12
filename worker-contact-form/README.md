# Booking + contact form setup

Two separate systems, both automatic once set up:

- **Booking a scoping call** → Cal.com inline embed (no worker needed)
- **General questions form** → this `worker-contact-form` Worker → Resend
  email + Google Sheet row

---

## Part A: Cal.com booking (do this first, it's the easiest)

1. Sign up free at https://cal.com (use your Google account for one-click
   Google Calendar sync)
2. Connect your Google Calendar: Settings → Apps → Google Calendar → Connect.
   This is what prevents double-bookings.
3. Create an event type: Event Types → New → name it "Scoping Call", set
   duration to 20 or 30 minutes, and set your availability (e.g. weekdays
   9am-5pm).
4. Open the event type, note the URL — it looks like
   `cal.com/your-username/scoping-call`. The part after `cal.com/` is your
   `CAL_LINK`.
5. In `src/components/CalEmbed.astro`, replace:
   ```js
   const CAL_LINK = "YOUR-CAL-USERNAME/scoping-call";
   ```
   with your actual value, e.g. `"sammiliu/scoping-call"`.
6. Commit and push — the embed will appear on your Contact page.

That's it — bookings will now auto-create Google Calendar events, send
confirmation emails, and send reminder emails, all handled by Cal.com.

---

## Part B: Contact form → Resend + Google Sheet

### B1. Google Sheet

1. Create a new Google Sheet, rename the first tab to `Leads`.
2. Extensions → Apps Script, paste in the contents of
   `worker-contact-form/google-apps-script.js`.
3. Deploy → New deployment → Web app → Execute as "Me", Access "Anyone".
4. Authorize when prompted (it's your own script on your own sheet).
5. Copy the Web App URL — you'll use this in step B3.

### B2. Resend (email notifications)

1. Sign up free at https://resend.com (3,000 emails/month free)
2. For quick testing, you can send from Resend's shared sandbox address
   `onboarding@resend.dev` with no setup — good enough to get started.
   To send from your own domain (e.g. `noreply@lzproxy.com.au`) later,
   verify that domain under Domains → Add Domain, and update `RESEND_FROM`
   in `wrangler.toml` accordingly.
3. Go to API Keys → Create API Key, copy it.

### B3. Deploy the worker

```bash
cd worker-contact-form
wrangler deploy
```

Then set your secrets:
```bash
wrangler secret put RESEND_API_KEY
# paste your Resend API key

wrangler secret put SHEETS_WEBHOOK_URL
# paste your Apps Script Web App URL from B1
```

Open `wrangler.toml` and update:
- `NOTIFY_EMAIL` — the address that should receive lead notifications
- `RESEND_FROM` — leave as `onboarding@resend.dev` for now, or your verified
  domain address later
- `ALLOWED_ORIGIN` — confirm it matches your live site's URL

Re-run `wrangler deploy` after any `wrangler.toml` changes.

### B4. Point the contact form at the worker

Copy the Worker URL from the deploy output into
`src/pages/contact.astro`:
```js
const CONTACT_WORKER_URL = "https://lzproxy-contact.YOUR-SUBDOMAIN.workers.dev";
```

Commit and push. Submissions will now land in your inbox and your Sheet
within seconds.

---

## Cost summary

- Cal.com: free for individuals, unlimited bookings
- Resend: free up to 3,000 emails/month
- Google Sheets + Apps Script: free
- Cloudflare Workers: free up to 100,000 requests/day

Realistically $0/month at small-business volume.
