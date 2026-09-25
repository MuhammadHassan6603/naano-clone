# Naano Rebuild

A rebuild of [naano.com](https://naano.com), the B2B LinkedIn creator
marketplace, made as a take-home assignment for **8x**. It is not affiliated
with naano.

**The change we made:** naano admits that booked posts don't always get
published. Here the brand's money is held in escrow when it books, released to
the creator only when the post is verified live, and refunded automatically if
the creator declines or misses the deadline.

Accounts, bookings, balances and clicks are real records in a real Postgres
database. The money is demo money: no card is charged and nothing is paid out.

- Frontend: https://muhammadhassan6603.github.io/naano-clone/
- API: https://naano-clone-9pyv.onrender.com (`/health`)
- Plan and API reference: [PLAN.md](PLAN.md)

## Demo accounts

Every account uses the password `naano-demo-2026`.

| Email | Role | What to look at |
| --- | --- | --- |
| `acme@demo.test` | Brand | One booking in every stage, and a post waiting for approval |
| `maya@demo.test` | Creator | A new booking request waiting to be accepted |
| `priya@demo.test` | Creator | Delivered 5 of 5 |
| `pipewise@demo.test` | Brand | The brand behind most past bookings |

The login page has one-click buttons for these. The API runs on a free plan
that sleeps when idle, so the first request can take up to a minute.

## Stack

| Part | Choice |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, react-router |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL on Neon, through Prisma 7 |
| Hosting | GitHub Pages (frontend), Render (API) |

## Running it locally

```bash
cd backend
npm install                   # also generates the Prisma client
cp .env.example .env          # fill in the Neon URLs and a JWT_SECRET
npx prisma migrate deploy     # create the tables (first run only)
npm run seed                  # demo accounts and bookings
npm run dev                   # http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173, talks to localhost:4000
```

Backend checks:

```bash
npm test                      # 147 API tests; needs TEST_DATABASE=1 in .env
npm run check                 # end-to-end escrow check against a running server
npm run db:studio             # browse the tables
```

`backend/requests.http` has every endpoint, including the failure cases, for
the VS Code REST Client.

## Layout

```
frontend/src/
  pages/          one file per route
  components/     shared UI; components/ui/ holds buttons, fields, notices, icons
  lib/            API client, session, data hook, formatting, validation
backend/
  src/escrow.ts   the only code that moves money or changes a booking's status
  src/routes/     HTTP layer: validate input, check who is calling, respond
  prisma/         schema, migrations, seed
  test/           API tests
worker/           Cloudflare Worker for the earlier AI assistant (not used by the app)
.agent-logs/      transcripts of the sessions that produced this
```

## Deployment

The API deploys to Render from `render.yaml` on every push to `main`.

The frontend is published to GitHub Pages:

```bash
cd frontend
npm run deploy      # builds with the Pages base path, force-pushes dist/ to gh-pages
```

`index.html` is copied to `404.html` because Pages has no rewrite rules; that
is what makes deep links such as `/creators/:id` work.
