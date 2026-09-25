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
cd frontend
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

The backend is a separate Node service (Express, TypeScript, Prisma, Postgres
on Neon):

```bash
cd backend
npm install                   # also generates the Prisma client
cp .env.example .env          # fill in the Neon URLs and a JWT_SECRET
npx prisma migrate deploy     # create the tables (first run only)
npm run dev                   # :4000
npm test                      # API tests against the database in .env
npm run db:studio             # browse the tables
```

`backend/requests.http` has every endpoint, including the failure cases, for
the VS Code REST Client. The backend deploys to Render from `render.yaml`.

## Layout

```
frontend/           React app (Vite, TypeScript, Tailwind)
  src/
    main.tsx          root
    App.tsx           routes, and the chrome shared across them
    index.css         theme, animations, the page-specific stylesheets
    sections/         home, /creators and /agencies sections
    pages/            one file per route
    components/       shared pieces
    lib/              assets, motion presets, blog content, chat transport
backend/            Node + Express + TypeScript API backed by Postgres
worker/             Cloudflare Worker holding the Gemini key
.agent-logs/        transcripts of the sessions that produced this
```

## Deployment

Live at **https://muhammadhassan6603.github.io/naano-clone/**

```bash
cd frontend
npm run deploy      # builds with the Pages base path, force-pushes dist/ to gh-pages
```

Pages serves the `gh-pages` branch. `VITE_BASE` in the `build:pages` script sets
the subpath for both the bundle and the router, so renaming the repo means
editing that one string. `index.html` is copied to `404.html` because Pages has
no rewrite rules — that is what makes deep links work.

The assistant's endpoint is baked in from `.env.production`. That URL is public
on purpose: the Gemini key is a Cloudflare secret, and `ALLOWED_ORIGINS` in
`worker/wrangler.toml` limits the worker to this site's origin so it cannot be
reused as an open Gemini proxy. The key is not in this repository, not in the
bundle, and never sent to the browser.
