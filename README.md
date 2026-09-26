# Naano Rebuild

A rebuild of [naano.com](https://naano.com), the B2B marketplace where companies book LinkedIn creators to post
about their product. Built as a take-home assignment for **8x**. It is not affiliated with naano.

**The one-line pitch:** naano admits that booked posts don't always get published. Here the brand's money is held in
escrow when it books, released to the creator only when the post is verified live, and refunded automatically if the
creator declines or misses the deadline.

| | |
| --- | --- |
| Live site | https://muhammadhassan6603.github.io/naano-clone/ |
| API | https://naano-clone-9pyv.onrender.com (`/health`) |
| Original build plan and API reference | [PLAN.md](PLAN.md) |
| Agent session logs | [.agent-logs/](.agent-logs/) |

Everything is real except the money: accounts, bookings, balances, ledger entries, clicks, messages and notifications
are stored in Postgres. Balances are demo money; no card is charged and nothing is paid out.

> The API runs on Render's free plan and sleeps when idle. The first request after a quiet spell can take up to a
> minute; after that it is fast.

---

## Try it

Every demo account uses the password **`naano-demo-2026`**. The login page has one-click buttons for the main ones.

| Account | Role | What to look at |
| --- | --- | --- |
| `acme@demo.test` (Acme CRM) | Brand | A booking in every stage: a new request, one being written, a post waiting for approval, paid, declined and expired. Unread message and notifications. |
| `pipewise@demo.test` (Pipewise) | Brand | The brand behind most past bookings. Only finished bookings, so the Bookings page opens on Completed. |
| `olivia@demo.test` (Olivia Bennett) | Creator | A new request from Acme waiting to be accepted, with a message about it. |
| `emily@demo.test` (Emily Carter) | Creator | A post waiting for Acme's approval, and a 5 of 5 delivery record. |
| `hassan@demo.test` (Muhammad Hassan) | Creator | An AI creator with a linked LinkedIn profile and a clean delivery record. |
| `daniel@`, `tom@`, `sophie@`, `james@`, `hannah@`, `lucas@demo.test` | Creators | Different niches, prices and track records for the marketplace. |

**A good 5-minute tour:** log in as **Acme** in one window and **Olivia** in another (for example a private window).
Book Olivia from Acme and watch her dashboard update on its own with a notification. Accept as Olivia, message each
other, submit a LinkedIn post link, then approve it as Acme and watch the money move in both wallets.

---

## What's in it

### For brands

- **Marketplace** with creator cards (price, followers, delivery record, LinkedIn link), filters by niche and price,
  sorting, **search** by name, niche, audience or bio, and **pagination**.
- **"Who you sell to"**: a brand describes its niches, audience and budget once. Every creator card then shows the
  **reasons** that creator fits or doesn't ("RevOps niche", "Audience: SaaS, founders", "$150 over your budget"), and
  the marketplace can sort by best fit.
- **Booking with escrow**: the creator's price moves from the brand's available balance into escrow the moment the
  brand books. Demo money can be added from the booking page or the wallet.
- **Booking page**: what happens next, the full timeline, the brief, the money, the tracked link and **link insights**
  (total clicks, unique visitors, clicks per day), plus a **conversation** with the creator.
- **Approve and pay** with a confirmation step. If the brand does nothing, the post is approved automatically after
  72 hours.
- **Wallet** with available and held balances and a ledger that is shown to reconcile with the balance.

### For creators

- **Two-step signup**: create the account, then complete the profile straight away (or skip and do it later from the
  dashboard). Brands get the same second step for "Who you sell to".
- **Profile** with niche, price per post, audience, bio, follower count and a required **LinkedIn profile link**, which
  appears on the card so brands can check who they are booking. One LinkedIn profile can belong to one account only.
- **Requests**: accept or decline. Declining refunds the brand immediately.
- **Tracked link** to put in the post, then **submit the post URL**. Payment arrives when the post is verified.
- **Wallet** showing earnings from verified posts.

### For both

- **Live updates**: when the other side books, accepts, declines, posts, pays or sends a message, open dashboards
  update within about a second, without reloading.
- **Notifications**: a banner at the top right (across the top on phones) with a short chime that can be turned off,
  and a bell with the recent list and "Mark all as read". Clicking one opens the booking.
- **Messaging** on every booking, visible only to that booking's brand and creator, with unread badges.
- **AI assistant** in the dashboard: ask "how much is held in escrow?", "which posts need my approval?", "any new
  messages?" or "where do I change my price?". It answers from the database and can open the right screen and
  highlight the part you asked about. It never moves money: asking it to approve opens the booking and highlights
  the button.
- Works on desktop and phones, and every page handles loading, empty and error states, including the slow first
  request.

---

## What's different from naano

naano's public product: companies find LinkedIn creators whose audience overlaps their buyers, pay per post, and
track clicks, leads and pipeline. naano openly says booked posts are not always published. This rebuild keeps the
marketplace idea and changes how trust works.

| Area | naano | This rebuild | Why |
| --- | --- | --- | --- |
| Paying for a post | Pay per post, no guarantee the post goes live | **Escrow**: money is held at booking, paid only after verification, refunded automatically on decline or missed deadline | Removes the risk naano itself admits to |
| Verifying delivery | Not shown | Verified by whichever comes first: the brand approves, the **first real reader clicks** the tracked link, or **72 hours** pass | The brand can't stall payment forever, and the creator can't get paid for nothing |
| Click tracking | Tracked links | Tracked links that **ignore link-preview bots** (LinkedIn, Slack, WhatsApp) and the **creator's own clicks** when deciding payment | A crawler or the creator shouldn't trigger payment |
| Creator quality | Stats and a match score | **Delivery record** counted from real bookings ("delivered 5 of 5"), ranked with a confidence-adjusted score, and the creator's **LinkedIn profile** one click away | Numbers anyone can check beat numbers you have to trust |
| Fit | A single match percentage | **Explained fit**: the concrete reasons a creator fits or doesn't, including the misses | A bare "92%" can't be checked or argued with |
| Brand and creator talking | Outside the platform | **Messaging** on each booking | Questions about the brief stay with the booking |
| Staying up to date | Refreshing the page | **Live updates and notifications**, with sound | Nobody has to wonder whether something happened |
| Help | Help pages | An **assistant** that answers from the user's own data and takes them to the right screen | Faster than looking for it |
| Money records | Not shown | An **append-only ledger**; every balance equals the sum of its entries, and the wallet shows that it reconciles | Money that can't be edited after the fact |

### What naano has that this rebuild doesn't (yet)

- **Leads and pipeline tracking.** Only clicks are tracked here. The plan: add a click ID to the brand's landing page,
  let the brand report sign-ups, demos and deals through a small script or a server call, and show leads, pipeline and
  cost per lead on each booking.
- Campaigns that book several creators with one brief, agency pages, the blog and the free tools.
- Real card payments and payouts. The escrow, ledger and refunds are real; the money is not.

---

## How the escrow works

```
            book (price held)
                 │
             requested ──── decline ────────────────► refunded (to brand)
                 │  accept                              ▲
             accepted ───── deadline passes ────────────┘
                 │  submit post URL
             submitted ──── brand approves ─┐
                 │  first real click ───────┼──────► paid (to creator)
                 │  72 hours pass ──────────┘
```

- Every step is one database transaction that moves the money and changes the status together, guarded by a
  conditional update, so two actions racing (say an approval and a click) can't both succeed.
- The ledger table is **append-only**: a database trigger rejects updates and deletes. Check constraints stop
  balances going negative and keep statuses consistent (a paid booking must say how it was verified, a refunded one
  why).
- A background job every minute expires missed deadlines and auto-approves posts after 72 hours. The same check also
  runs before bookings are read, so nobody sees stale state.
- Notifications and live updates are written in the same transaction as the change they describe and published only
  after it commits, so nobody is told about something that didn't happen.

---

## Design decisions

- **The assistant never writes numbers.** Gemini only works out what the question is asking (wallet, clicks with
  Emily, where is X). The server then builds the answer from the database with the same formatting as the dashboard.
  The model never sees account data, so it can't invent or leak it. The suggestion chips skip the model entirely, and
  a keyword router answers if the model is unavailable.
- **Verified followers were tried and removed.** LinkedIn only shows follower counts to outside requests for a few
  famous profiles, so automatic lookup failed for most creators. Followers are entered by the creator, and the
  required LinkedIn link lets any brand check them.
- **Live updates use server-sent events** with the login token in a header, not in the URL. Pages reload only the
  data they show. Connections close when a tab is hidden, so they never use up the browser's connection limit, and
  polling remains as a fallback.
- **Statuses that last zero time aren't stored.** "Verified" and "declined" happen in the same transaction as paying
  and refunding, so the booking stores `paid` with `verified_via`, and `refunded` with `refund_reason`.
- **Demo data is played through the real escrow functions** with past timestamps, one transaction per booking, so the
  history is consistent and every wallet reconciles.

## Known limitations

- The free Render plan sleeps, so the first request can take up to a minute.
- Live updates, the assistant's rate limit and the message rate limit are kept in one server's memory. More than one
  API instance would need a shared channel such as Postgres `LISTEN/NOTIFY` or Redis.
- The free Gemini quota is small. When it runs out, the assistant falls back to keyword matching, which understands
  fewer ways of phrasing a question but still answers from the database.
- Follower counts are self-reported, and a creator can't be proven to own the LinkedIn profile they link. "Sign in
  with LinkedIn" would fix ownership.
- A creator on a different network could still click their own link to trigger payment. Brand approval and the
  72-hour timeout have no such gap.
- Pagination happens after sorting in memory, which is fine for hundreds of creators, not for hundreds of thousands.

---

## Stack

| Part | Choice |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, react-router 7 |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL on Neon, through Prisma 7 |
| AI | Google Gemini (Flash-Lite, then Flash, then Gemma), with a keyword fallback |
| Hosting | GitHub Pages (frontend), Render (API, deployed from `render.yaml`) |

## Running it locally

```bash
cd backend
npm install                   # also generates the Prisma client
cp .env.example .env          # Neon URLs, a JWT_SECRET, optionally GEMINI_API_KEY
npx prisma migrate deploy     # create the tables
npm run seed                  # demo accounts and bookings
npm run dev                   # http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173, talks to localhost:4000
```

To start over with clean demo data, `npm run seed -- --reset --yes` empties every table first. It refuses to run
without `--yes`.

## Tests

```bash
cd backend
npm test          # 224 API tests; needs TEST_DATABASE=1 in .env (a separate database branch)
npm run check     # end-to-end escrow check against a running server
```

The API tests cover the escrow rules and races, the ledger, bookings, tracked links and bot filtering, the
marketplace, fit, search and pagination, messaging, notifications, the live update stream and the assistant, which
is checked word for word against the database. During development the app was also driven end to end in a real
browser, as two users at once, on desktop and phone sizes.

`backend/requests.http` has every endpoint, including the failure cases, for the VS Code REST Client.

## Layout

```
frontend/src/
  pages/            one file per route; pages/dashboard/ for the logged-in area
  components/       shared UI: cards, forms, notifications, the assistant, dashboard pieces
  lib/              API client, session, data hook, formatting, validation
backend/
  src/escrow.ts     the only code that moves money or changes a booking's status
  src/assistant.ts  question routing and database-built answers
  src/routes/       HTTP layer: validate input, check who is calling, respond
  prisma/           schema, migrations, seed
  test/             API tests
worker/             Cloudflare Worker from an earlier version of the assistant (no longer used)
.agent-logs/        transcripts of the AI sessions that built this
```

## Deployment

The API deploys to Render from `render.yaml` on every push to `main`, and applies database migrations on start.

The frontend is published to GitHub Pages with `npm run deploy` in `frontend/`. `index.html` is copied to
`404.html` so deep links such as `/creators/:id` work on Pages.
