# naano-ai worker

The assistant's Gemini key lives here, as an encrypted Cloudflare secret. It is
never in this repository, never in the bundle, and never sent to the browser.
The page only ever talks to this worker; the worker talks to Gemini.

```
browser ──POST /──► worker ──x-goog-api-key──► Gemini
        ◄─NDJSON──        ◄──────SSE─────────
```

Deployed at `https://naano-ai.ammtech.workers.dev`, answering
`https://muhammadhassan6603.github.io` plus the two localhost dev ports.

## First deploy

```bash
cd worker
npm install
npx wrangler login

# paste the Gemini key when prompted; it is encrypted at rest and is not
# readable again, not even by you
npx wrangler secret put GEMINI_API_KEY

npx wrangler deploy
```

`deploy` prints the worker URL, something like
`https://naano-ai.<your-subdomain>.workers.dev`.

## Point the site at it

Two things, both one-liners:

1. Add the site's own origin to `ALLOWED_ORIGINS` in `wrangler.toml`, then
   `npx wrangler deploy` again. Anything not on that list gets a 403, so the
   worker cannot be used as a free Gemini proxy by someone else's page.
2. Set `VITE_AI_ENDPOINT` to the worker URL and rebuild the site. On GitHub
   Pages the value is baked in at build time from `.env.production` in the repo
   root; on a host with real environment variables, set it there instead.

## Running it locally

```bash
cd worker
echo 'GEMINI_API_KEY = "your-key-here"' > .dev.vars   # gitignored
npx wrangler dev                                       # serves on :8787
```

Then `npm run dev` in the repo root. Vite proxies `/api/chat` to `:8787`, so
the browser stays same-origin and no key reaches it.

## Notes

- Model is `gemini-2.5-flash` with `thinkingBudget: 0`, streamed, so the first
  token lands fast and the bar renders it as it arrives.
- The system prompt is in `src/index.ts`. It tells the model this site is a
  rebuild of naano.com made as a take-home for 8x, and to be upfront that
  nothing here transacts.
- Requests are capped at 12 messages and 2000 characters each before they
  reach Gemini.
