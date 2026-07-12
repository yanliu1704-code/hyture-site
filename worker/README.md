# LZproxy chat worker

This is the backend for the "Ask LZproxy" chat widget. It's a small Cloudflare
Worker that receives a message from the widget, adds a system prompt grounded
in LZproxy's actual services/tiers, and forwards it to DeepSeek.

## 1. Get a DeepSeek API key

1. Sign up / log in at https://platform.deepseek.com
2. Go to API keys → create a new key (starts with `sk-`)
3. Top up a small amount of credit (this is extremely cheap — a few cents
   covers thousands of typical chat replies on `deepseek-v4-flash`)

## 2. Install Wrangler (Cloudflare's CLI) if you haven't already

```bash
npm install -g wrangler
wrangler login
```

## 3. Deploy the worker

```bash
cd worker
wrangler deploy
```

This will print a URL like:
```
https://lzproxy-chat.<your-subdomain>.workers.dev
```
Copy that URL.

## 4. Set your DeepSeek API key as a secret (never commit it to git)

```bash
wrangler secret put DEEPSEEK_API_KEY
```
Paste your `sk-...` key when prompted.

## 5. Confirm the allowed origin

Open `wrangler.toml` and check `ALLOWED_ORIGIN` matches your live site's exact
URL (no trailing slash) — it's already set to the current
`hyture-site.yanliu1704.workers.dev` URL. Update this if you later attach a
custom domain, then run `wrangler deploy` again.

## 6. Point the chat widget at your worker

In `src/components/ChatWidget.astro`, find this line near the top:
```js
const CHAT_WORKER_URL = "https://lzproxy-chat.YOUR-SUBDOMAIN.workers.dev";
```
Replace it with the actual URL from step 3. Commit and push — Cloudflare
Pages will redeploy your site automatically, and the widget will now talk to
the real assistant.

## Cost

DeepSeek's `deepseek-v4-flash` model is priced per token and is very cheap —
realistically a few dollars a month even with heavy traffic, since each
chat reply is capped at 300 tokens and the system prompt is short. Cloudflare
Workers' free tier covers 100,000 requests/day, which is far more than a
small business site will need.

## Optional: rate limiting

To stop abuse (someone spamming the widget to run up your DeepSeek bill),
add a Cloudflare **Rate Limiting Rule** in the dashboard:
Security → WAF → Rate limiting rules → Create rule, scoped to this Worker's
route, e.g. "block after 20 requests per minute per IP". No code change
needed — this is a dashboard-only setting.
