# naano.com rebuild

A from-scratch rebuild of [naano.com](https://naano.com), done as a 24-hour
take-home for **8x**.

This is a clone built to demonstrate front-end work. It is not affiliated with
naano, and nothing on it transacts — sign-up, login, booking and the agency
forms reproduce the real flows but do not create accounts, take payment, or
book anything. Images and video are hotlinked from naano.com rather than
re-hosted.

## Stack

React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · motion · react-router

## Running it

```bash
npm install
npm run dev
```

The assistant needs the worker as well — see [`worker/README.md`](worker/README.md).

```bash
cd worker
npm install
echo 'GEMINI_API_KEY = "your-key"' > .dev.vars   # gitignored
npx wrangler dev                                  # :8787
```

Vite proxies `/api/chat` to the worker, so the browser stays same-origin and
the key never reaches it.

## Layout

```
src/
  main.tsx          root
  App.tsx           routes, and the chrome shared across them
  index.css         theme, animations, the page-specific stylesheets
  sections/         home, /creators and /agencies sections
  pages/            one file per route
  components/       shared pieces
  lib/              assets, motion presets, blog content, chat transport
worker/             Cloudflare Worker holding the Gemini key
.agent-logs/        transcripts of the sessions that produced this
```

## Deployment

The site is static and deploys to GitHub Pages from `.github/workflows/deploy.yml`
on every push to `main`. Two settings live outside the repo:

- **Repository variable `VITE_AI_ENDPOINT`** — the deployed worker's URL. Public,
  not a secret.
- **`ALLOWED_ORIGINS` in `worker/wrangler.toml`** — the origins the worker will
  answer, so it cannot be reused as an open Gemini proxy.

The Gemini key is a Cloudflare secret. It is not in this repository, not in the
bundle, and never sent to the browser.
