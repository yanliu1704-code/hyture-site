# Hyture site

Astro + Tailwind v4 static site.

## Local development
```
npm install
npm run dev
```

## Build
```
npm run build
```
Outputs to `dist/`.

## Deploy — Cloudflare Pages (git integration, recommended)
1. Push this repo to GitHub.
2. In the Cloudflare dashboard: Workers & Pages → Create → Pages → Connect to Git.
3. Select this repo. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. Cloudflare will redeploy automatically on every push to `main`.

## Deploy — Wrangler CLI (no GitHub needed)
```
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=hyture
```
