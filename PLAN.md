# Naano Rebuild: Build Plan

Written 25 Sep 2026. Deadline: end of Saturday 26 Sep 2026.

This plan puts the research doc ("Naano Rebuild: What Naano Does and Our Plan") into code. It covers the backend (schema, every endpoint, background jobs, deployment) and the frontend (what gets deleted, what gets built, and how it connects to the API).

**The pitch:** Naano admits that booked posts don't always get published. We hold the brand's money in escrow and release it to the creator only when the post is verified live.

---

## 0. Where we are

| Step | Status |
|---|---|
| Repo split into `frontend/` and `backend/` | Done, committed |
| Backend connects to Neon, `/health` returns 200 | Done, committed |
| `backend/.env` holds the real credentials and is gitignored | Done |
| Push to GitHub | **Not done.** The two local commits still need `git push origin main` |
| Backend uses raw `pg` | Will be replaced with Prisma (step 3) to match the research doc |

---

## 1. Decisions that differ from the research doc

Each one is small, and each has a reason. Push back on any of them before step 5 starts.

1. **Expire bookings that are still `requested`, not only `accepted` ones.** The doc's diagram only has `accepted → expired`. If a creator never replies, the brand's money would stay held forever. The deadline applies from the moment the brand books.
2. **`verified`, `declined` and `expired` are not saved as statuses.** Verifying a post and paying the creator happen in the same database transaction, and so do declining and refunding. A status that would only exist for zero milliseconds should not be stored in a row. What we store instead:
   - `status` is one of `requested | accepted | submitted | paid | refunded`
   - `verified_via` is one of `brand | click | timeout` and is set when a booking is paid
   - `refund_reason` is one of `declined | expired` and is set when a booking is refunded

   The frontend timeline still shows "Verified (first click)" and "Declined, refunded", so the demo reads the same as the diagram.
3. **The ledger gets a fifth type, `payout`.** Releasing money touches two wallets: the brand's held balance goes down and the creator's available balance goes up. Writing one ledger row per wallet means every balance equals the sum of its own rows. The types are `topup`, `hold`, `release` (brand side), `payout` (creator side) and `refund`.
4. **A creator's own click does not count as the verifying click.** Otherwise a creator could click their own link to get paid. We save a hash of the creator's IP when they submit the post, and ignore clicks from that same hash when checking for verification. The click is still counted in stats. The limit: a creator on a different network can still fake a click. Brand approval and the 72-hour timeout have no such hole.
7. **Bots never count as clicks.** LinkedIn's crawler fetches every link in a post to build the preview card, and it would hit `/r/:code` just like a person. Without a filter, a re-crawl after submission would pay the creator with no human involved. Requests with an empty user agent, or one that matches `bot|crawler|spider|preview|facebookexternalhit|WhatsApp|Slack|curl|wget|python-requests|Go-http-client` (this covers `LinkedInBot`), are still redirected but are not recorded and never trigger payment. The limit: user agents can be faked, so this stops accidental payment, not a determined cheat.
8. **The escrow functions take an optional `at` time** (default: now). The seed passes past times to create history such as "paid by timeout" or "expired". Timestamps and ledger rows are written correctly the first time, with no backdating afterwards, so `reconciled` stays true.
5. **`GET /wallet` returns a `reconciled` flag.** The server recomputes the balance from the ledger and compares it with the stored wallet. This covers walkthrough point 5 ("show the transactions history adding up") in one line on screen.
6. **Status history comes from timestamp columns.** We use `created_at`, `accepted_at`, `submitted_at` and `closed_at` plus the transactions for that booking. There is no seventh table.

---

## 2. Backend

### 2.1 Stack

| Part | Choice |
|---|---|
| Runtime | Node.js, Express 5 (async errors are caught without extra code), TypeScript |
| Database | Neon Postgres. `DATABASE_URL` (pooled) at runtime, `DIRECT_URL` for migrations |
| ORM | Prisma: schema, migrations, Studio |
| Auth | `bcryptjs` for password hashes, `jsonwebtoken` for tokens sent as `Authorization: Bearer <token>`, valid for 7 days |
| Validation | Plain checks in each handler. Six request bodies don't need a validation library |
| Jobs | One `setInterval` every 60 seconds inside the server process |
| Deploy | Render free web service, US East |

Environment variables (`backend/.env`, gitignored; placeholders go in `.env.example`):

```
DATABASE_URL=        # Neon pooled
DIRECT_URL=          # Neon direct, used by prisma migrate
JWT_SECRET=          # long random string
ALLOWED_ORIGINS=http://localhost:5173,https://muhammadhassan6603.github.io
PUBLIC_API_URL=http://localhost:4000   # optional; tracking-link base, defaults to the request's host
TEST_DATABASE=1      # only on the Neon test branch; npm test refuses to run without it
AUTO_APPROVE_HOURS=72
PORT=4000
```

### 2.2 Folder layout

```
backend/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    index.ts          app, middleware, routes, starts the job loop
    db.ts             Prisma client
    auth.ts           hashing, JWT, requireAuth / requireRole middleware
    errors.ts         HttpError class + error middleware
    routes/
      auth.ts
      creators.ts
      wallet.ts
      bookings.ts
      tracking.ts
    escrow.ts         every money-moving state change lives here
    jobs.ts           sweep(): expire + auto-approve
  scripts/
    escrow-check.ts   one runnable end-to-end check of the money path
  requests.http       every endpoint, success and failure cases
```

`escrow.ts` is the only file that writes to `wallets`, `transactions` or `bookings.status`. The routes and the job both call it, so the rules live in one place.

### 2.3 Database schema

All money is stored as whole cents in integer columns. IDs are UUIDs.

**users**

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| email | text UNIQUE | lowercased before insert |
| password_hash | text | bcrypt, cost 10 |
| name | text | |
| role | enum `brand \| creator` | set at signup, never updated |
| created_at | timestamptz | |

**creator_profiles** (one per creator user)

| column | type | notes |
|---|---|---|
| user_id | uuid PK, FK users | |
| niche | text | from a fixed list, e.g. `RevOps`, `Sales`, `SEO`, `AI`, `Founders`, `Marketing`, `DevTools`, `HR` |
| bio | text | |
| audience | text | e.g. "SaaS founders, seed to Series B" |
| price_cents | int | CHECK > 0 |
| followers | int | CHECK >= 0 |
| updated_at | timestamptz | |

**wallets** (created in the same transaction as the user)

| column | type | notes |
|---|---|---|
| user_id | uuid PK, FK users | |
| available_cents | int | CHECK >= 0 |
| held_cents | int | CHECK >= 0 |

**transactions** (append-only; the code never updates or deletes a row)

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | whose wallet this row changes |
| booking_id | uuid FK, nullable | null for top-ups |
| type | enum `topup \| hold \| release \| payout \| refund` | |
| amount_cents | int | always positive; the type decides the direction |
| created_at | timestamptz | |

How each type changes the wallet it belongs to:

| type | available | held |
|---|---|---|
| topup | +amount | |
| hold | −amount | +amount |
| release | | −amount |
| payout | +amount | |
| refund | +amount | −amount |

**bookings**

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| brand_id | uuid FK users | |
| creator_id | uuid FK users | |
| brief | text | |
| destination_url | text | the brand's site; tracked clicks are sent here |
| price_cents | int | copied from the creator's profile at booking time, so later price changes don't affect it |
| status | enum `requested \| accepted \| submitted \| paid \| refunded` | |
| deadline | timestamptz | the creator must submit the post link by this time |
| post_url | text, nullable | the LinkedIn post, set on submit |
| tracking_code | text UNIQUE | 8 random base64url characters |
| verified_via | enum `brand \| click \| timeout`, nullable | |
| refund_reason | enum `declined \| expired`, nullable | |
| submit_ip_hash | text, nullable | used for decision 4 |
| created_at, accepted_at, submitted_at, closed_at | timestamptz | |

Indexes: `(status, deadline)` and `(status, submitted_at)` for the sweep job; `(brand_id)` and `(creator_id)` for listing bookings.

**clicks**

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| booking_id | uuid FK | |
| clicked_at | timestamptz | |
| ip_hash | text | HMAC-SHA256 of the IP keyed with the server secret; the raw IP is never stored |
| user_agent | text | cut to 300 characters |

Bot requests are not stored at all (decision 7).

Prisma's schema file can't express CHECK constraints, so we add them by hand to the first migration's SQL. They are the last line of defence against a negative balance, even if the code has a bug.

### 2.4 How escrow stays correct under concurrent requests

The research doc lists two questions to be able to answer. Both are answered by the same mechanism: **conditional updates inside one database transaction.**

- **What stops two requests from spending the same money twice?** The hold is a single statement:
  `UPDATE wallets SET available = available - $p, held = held + $p WHERE user_id = $b AND available >= $p`.
  Postgres locks the row. If two bookings race, the second one sees the reduced balance, matches 0 rows, and we return **409 Insufficient funds**. The CHECK constraint backs this up.
- **How does the server refuse a step out of order?** Every transition is also conditional:
  `UPDATE bookings SET status='accepted', accepted_at=now() WHERE id=$id AND status='requested'`.
  If it matches 0 rows, the booking wasn't in the right state and we return **409**. This also makes the sweep job and a user's click safe when they race: only one of them wins.
- **Why use one transaction instead of separate updates?** A hold writes the booking row, the wallet and the ledger row. If one write fails, all of them roll back. That is how the money never ends up held with no booking, or paid without a ledger line.

In Prisma this is `prisma.$transaction(async (tx) => { ... })` with `tx.wallet.updateMany({ where: { userId, availableCents: { gte: p } }, ... })`. `updateMany` returns `{ count }`, which is exactly the "0 rows means 409" check.

`escrow.ts` functions. Each one is a single transaction and takes an optional `at` time (decision 8):

| function | booking change | money change | ledger rows |
|---|---|---|---|
| `createBooking` | → `requested` | brand available → held | brand `hold` |
| `accept` | `requested` → `accepted` | none | none |
| `submit` | `accepted` → `submitted` (only if `now <= deadline`) | none | none |
| `pay(via)` | `submitted` → `paid` | brand held −p, creator available +p | brand `release`, creator `payout` |
| `refund(reason)` | `requested` or `accepted` → `refunded` | brand held → available | brand `refund` |

### 2.5 API: all 19 endpoints

Conventions:
- JSON in and out. Errors come back as `{ "error": "human-readable message" }` with the status codes below.
- Money is always `*Cents` integers. Timestamps are ISO strings.
- "Auth" means a valid Bearer token is required.

| code | when |
|---|---|
| 400 | invalid input (missing field, bad URL, price ≤ 0, deadline in the past) |
| 401 | no token, bad token, wrong email/password |
| 403 | wrong role, or not a party to the booking |
| 404 | the resource doesn't exist |
| 409 | state conflict: email taken, wrong booking state, insufficient funds, deadline passed |

Shared response shapes:

```ts
User       = { id, email, name, role: 'brand'|'creator', createdAt }
Creator    = { id, name, niche, bio, audience, priceCents, followers,
               reliability: { delivered: number, total: number } }
Booking    = { id, status, brief, destinationUrl, priceCents, deadline,
               postUrl, trackingUrl, verifiedVia, refundReason,
               createdAt, acceptedAt, submittedAt, closedAt,
               brand: { id, name }, creator: { id, name } }
Wallet     = { availableCents, heldCents, reconciled: boolean }
Transaction= { id, type, amountCents, bookingId, createdAt }
```

#### Auth

**1. `POST /auth/signup`** (anyone)
Body: `{ email, password, name, role }`
- Password must be at least 8 characters. `role` must be `brand` or `creator`.
- One transaction creates the user and a wallet at 0/0. For a creator it also creates an empty profile, which stays hidden from the marketplace until a price is set.
- 201 → `{ token, user: User }` · 400 · 409 email taken

**2. `POST /auth/login`** (anyone)
Body: `{ email, password }`
- 200 → `{ token, user: User }` · 401 with the same message for an unknown email or a wrong password, so the error doesn't reveal which emails have accounts

**3. `GET /auth/me`** (auth)
- 200 → `{ user: User, profile?: CreatorProfile }` · 401

#### Creators

**4. `GET /creators`** (anyone)
Query: `?niche=RevOps&maxPriceCents=50000&sort=reliability|price|followers` (default `reliability`)
- Returns only creators with a price set.
- Reliability: `delivered` = paid bookings, `total` = paid + expired. Declined bookings don't count: turning down a brief isn't a delivery failure. Computed with one `GROUP BY` query joined onto the list.
- Sorted by reliability: delivered/total descending, with new creators (total = 0) last. Ties are broken by followers.
- 200 → `{ creators: Creator[], niches: string[] }`. `niches` is the fixed list, so the frontend's filter never drifts from what the API accepts.

**5. `GET /creators/:id`** (anyone)
- 200 → `{ creator: Creator }` · 404 if the user isn't a creator or has no price set

**6. `PUT /creators/me/profile`** (auth, creator)
Body: `{ niche, bio, audience, priceCents, followers }`
- `niche` must be in the list. `priceCents` must be between 1 and 10,000,000. Text fields have length limits.
- A new price applies only to new bookings.
- 200 → `{ creator: Creator }` · 400 · 403 if the caller is a brand

#### Wallet

**7. `GET /wallet`** (auth)
- `reconciled` is true when the balance recomputed from this user's ledger rows (using the table in 2.3) equals the stored wallet.
- 200 → `Wallet`

**8. `POST /wallet/topup`** (auth, brand)
Body: `{ amountCents }`, an integer between 100 and 1,000,000 (demo cap of $10,000 per top-up)
- Adds to the wallet and writes a `topup` ledger row in one transaction.
- 200 → `Wallet` · 400 · 403 for creators

**9. `GET /wallet/transactions`** (auth)
- The newest 100 rows for this user.
- 200 → `{ transactions: Transaction[] }`

#### Bookings

**10. `POST /bookings`** (auth, brand)
Body: `{ creatorId, brief, destinationUrl, deadline }`
- `destinationUrl` must be http(s). `deadline` must be in the future and at most 60 days away. There is deliberately no minimum, so a 2-minute demo deadline works. `brief` is 20 to 5,000 characters.
- The price comes from the creator's profile. The client never sends a price.
- Calls `escrow.createBooking`.
- 201 → `{ booking: Booking }` · 400 · 403 · 404 creator not found · 409 insufficient funds

**11. `GET /bookings`** (auth)
Query: `?status=` (optional)
- A brand sees bookings it made, a creator sees bookings it received. Newest first.
- Runs `sweep()` first, so expired or auto-approved bookings show the right state even if the server just woke up.
- 200 → `{ bookings: Booking[] }`

**12. `GET /bookings/:id`** (auth, only the brand or creator on this booking)
- Runs `sweep(id)` first.
- Adds `timeline`: an ordered list of `{ at, event }` built from the timestamps and ledger rows, e.g. `booked, money held`, `accepted`, `post submitted`, `verified via first click`, `paid to creator`.
- `trackingUrl` = `${PUBLIC_API_URL}/r/${tracking_code}` (or the request's own host when `PUBLIC_API_URL` is unset). It is shown once the booking is accepted.
- `timeline` events are codes the frontend turns into labels: `booked`, `accepted`, `submitted`, `verified` (with `via`), `paid`, `declined`, `expired`, `refunded`.
- 200 → `{ booking: Booking & { timeline } }` · 403 · 404

**13. `POST /bookings/:id/accept`** (auth, the creator on this booking)
- `requested` → `accepted`. If the deadline has already passed, the booking is expired and refunded, and we return 409.
- 200 → `{ booking }` · 403 · 404 · 409

**14. `POST /bookings/:id/decline`** (auth, the creator on this booking)
- `requested` → `refunded` with `refund_reason = declined`, and the money goes back to the brand.
- 200 → `{ booking }` · 403 · 404 · 409

**15. `POST /bookings/:id/submit`** (auth, the creator on this booking)
Body: `{ postUrl }`, which must be an https URL on `linkedin.com`
- `accepted` → `submitted`, only if the deadline hasn't passed. Saves `submit_ip_hash`.
- 200 → `{ booking }` · 400 · 403 · 404 · 409

**16. `POST /bookings/:id/approve`** (auth, the brand on this booking)
- `submitted` → `paid` with `verified_via = brand`.
- 200 → `{ booking }` · 403 · 404 · 409 (e.g. approving a post that was never submitted — this is the walkthrough's "refused step" demo)

#### Tracking

**17. `GET /r/:code`** (anyone, no auth; this is the link that goes in the LinkedIn post)
- Always redirects with 302 to `destination_url`.
- Bot user agents (decision 7) stop there: nothing is recorded and nothing is paid.
- Otherwise it records a click (hashed IP, user agent). If the booking is `submitted` and the click's IP hash differs from `submit_ip_hash`, it calls `pay('click')`.
- The click write and the payment run without making the redirect wait. They are chained with `.catch(err => console.error(...))`, so a failure is logged and can never cause an unhandled rejection. If the payment loses a race (for example, the brand approved at the same moment), the conditional update matches 0 rows and nothing happens.
- Clicks on `requested` bookings are ignored, because the link hasn't been handed out yet. An unknown code gets 404.

**18. `GET /bookings/:id/stats`** (auth, the parties on the booking)
- 200 → `{ totalClicks, uniqueClicks, byDay: [{ date, clicks }] }`, where unique means distinct IP hashes

#### Health

**19. `GET /health`** (anyone)
- 200 → `{ ok: true }` after a `SELECT 1`. Already built.

### 2.6 Background job

The job lives in `jobs.ts`. `sweep(bookingId?)` does two things:

1. **Expire:** bookings in `requested` or `accepted` with `deadline < now()` → `refund('expired')`.
2. **Auto-approve:** bookings in `submitted` with `submitted_at < now() - AUTO_APPROVE_HOURS` → `pay('timeout')`.

It runs every 60 seconds, and also before `GET /bookings` and `GET /bookings/:id`, because the free Render server sleeps. Each item goes through the conditional updates in `escrow.ts`, so running the sweep twice at once is safe. The loop is not persisted anywhere, which is fine because the sweep catches up on every request.

`AUTO_APPROVE_HOURS` can be changed for the demo. 72 hours is the real rule.

### 2.7 Seed data (`prisma/seed.ts`)

- **2 brands** (e.g. "Acme CRM", "Pipewise"), each topped up to $5,000.
- **8 creators** across different niches, with realistic prices ($150 to $1,200) and follower counts.
- **Bookings in every state:** requested, accepted, submitted (with clicks), paid by brand approval, paid by first click, paid by timeout, refunded because declined, and refunded because expired. Past bookings create a real reliability history (e.g. one creator shows "Delivered 4 of 5").
- The seed creates everything through the `escrow.ts` functions, not raw inserts, and passes past `at` times for history (decision 8). The ledger always reconciles.
- There are no time-sensitive seeded bookings, because the seed runs hours or days before anyone reviews. To see a live expire-and-refund, the reviewer books with the "2 minutes (demo)" deadline in the booking form.

Demo logins (e.g. `brand@demo.naano`) go in the README. They are throwaway accounts on purpose, so the reviewer can log in. They are not secrets.

### 2.8 Testing

- **`requests.http`:** every endpoint with a success case and at least one failure case (401, 403, 409 out-of-order, 409 insufficient funds). Tokens are captured into variables.
- **`scripts/escrow-check.ts` (`npm run check`):** one script, run against a running server. It signs up a brand and a creator, tops up, books, then tries to approve before submit (expects 409). Then it accepts, submits and approves, and asserts both wallets and `reconciled`. It also checks that decline refunds, and that two bookings racing for the same money end with exactly one success. About 80 lines using `node:assert`, with no test framework.
- **Prisma Studio:** used to watch the rows change during development.

### 2.9 Deploy (Render)

- Build: `npm ci && npx prisma generate && npm run build`
- Start: `npx prisma migrate deploy && node dist/index.js`
- Set the environment variables in the Render dashboard. `PUBLIC_API_URL` is the Render URL.
- `ALLOWED_ORIGINS` includes the GitHub Pages origin.
- Run the seed once against Neon from a local machine: `npx prisma db seed`.

---

## 3. Frontend

### 3.1 Direction

The assignment asks for our own layout, and the research doc says the app should open straight into the marketplace. So the frontend changes from a clone of naano's marketing site into a small product app. React, Vite, Tailwind, motion and react-router all stay.

- **Layout:** a top app bar (logo, Marketplace, Bookings, Wallet, Profile for creators, account menu) above a content area with a max width of about 1200px. There are no marketing sections.
- **Visual language:** neutral surfaces and one accent colour, with status colours carrying meaning. Each booking status has one consistent colour: requested is grey, accepted is blue, submitted is amber, paid is green, refunded is slate. Money amounts always show two lines: *Available* and *Held in escrow*.
- **The escrow state is always visible.** Every booking card shows where the money is right now ("$450 held in escrow", "$450 paid to creator", "$450 refunded").

### 3.2 What gets deleted

It all stays in git history. Deleting it also shrinks the bundle a lot.

| Delete | Why |
|---|---|
| `pages/Home`, `Creators`, `Agencies`, `AgencySignup`, `Blog`, `BlogPost`, `FreeTools`, `CaseStudy`, `Book` | Marketing, sales, agencies and the calendar booking are all cut in the research doc |
| `sections/**` (Hero, Proof, Pricing, Workflow, Testimonial, Faq, Cta, Results, Marketplace, Header, Footer, creators/*) | Landing page sections |
| `components/ToolsNav`, `PostCard`, `MetricsPanel`, `SiteFooter`, `Accordion` | Only used by the pages above |
| `lib/blogPosts.tsx`, `lib/posts.ts`, `lib/useActiveHeading.ts` | Blog content |
| Page-specific blocks in `index.css` | Only the theme tokens and base styles are kept |

**Kept and reused:** `AuthShell` (the auth page frame), `Button`, `Icons`, `Reveal`, `lib/motion`, `ScrollManager`, and `MarketplaceCard`. The card gets props and becomes the live preview on the creator's profile editor; it already has the right slots for followers and cost per post. `AiBar` and the `aiChat` worker are kept for now (see open question 1).

### 3.3 Frontend foundation (new files)

| File | Purpose |
|---|---|
| `lib/api.ts` | `api(path, { method, body })`: a small fetch wrapper. It reads `VITE_API_URL`, attaches the Bearer token from `localStorage`, and throws `ApiError { status, message }`. Also exports `formatCents()` using `Intl.NumberFormat`. |
| `lib/auth.tsx` | `AuthProvider` + `useAuth()`: holds `user`, `login`, `signup`, `logout`. Calls `/auth/me` on load. `RequireAuth` redirects to `/login?next=…`, and `RequireRole` handles role-only pages. The token is kept in `localStorage`, which means any script injected into the page could read it. httpOnly cookies would avoid that, but GitHub Pages and Render are different sites, so the cookie would be a cross-site cookie, and browsers increasingly block those. The mitigation is having no `dangerouslySetInnerHTML` of user content, since that is the XSS route. |
| `lib/useApi.ts` | `useApi<T>(path)` → `{ data, error, loading, reload }` using `useEffect`. There is no react-query; the app has around 8 screens and refetches after every action. |
| `components/AppHeader.tsx` | Replaces the marketing `Header`. Links change with login state and role. |
| `components/CreatorCard.tsx` | Name, niche, price, followers, the reliability line, and a Book button. |
| `components/StatusBadge.tsx` | Status → label + colour. |
| `components/StatusTimeline.tsx` | Draws the `timeline` from `GET /bookings/:id`. It shows future steps as upcoming, so the user can see what happens next. |
| `components/MoneyLine.tsx` | "$450 held in escrow" style line for bookings. |

Environment: `.env.development` gets `VITE_API_URL=http://localhost:4000`, and `.env.production` gets `VITE_API_URL=https://<render-url>`. `VITE_AI_ENDPOINT` stays unchanged.

### 3.4 Routes and screens

| Route | Who | Screen | API calls |
|---|---|---|---|
| `/` | anyone | **Marketplace.** Filter bar (niche, max price, sort), a grid of `CreatorCard`s, and an empty state. Browsing works without signing up. | `GET /creators` |
| `/creators/:id` | anyone | **Creator profile.** Bio, audience, price, followers, reliability ("Delivered 14 of 15 on time"), and a Book button. A logged-out visitor goes to `/signup?role=brand&next=/book/:id`. A creator sees no Book button. | `GET /creators/:id` |
| `/signup` | logged out | Existing role chooser, then the form: name, email, password. The LinkedIn/Google buttons and "How did you hear about us" are removed because nothing stores them. Afterwards, `next` is followed, or brands go to `/` and creators to `/profile`. | `POST /auth/signup` |
| `/login` | logged out | Existing design with email and password only. The social buttons and "Forgot password" are removed. Server errors show inline. | `POST /auth/login` |
| `/book/:creatorId` | brand | **New booking.** The creator summary and a locked price, then the brief, destination URL and deadline (date-time input, with quick picks for 3, 7 and 14 days, plus "2 minutes (demo)" so a reviewer can watch an expiry and refund happen). It shows the wallet's available balance. If there isn't enough, an inline top-up appears. The submit button reads "Hold $450 and send request". | `GET /creators/:id`, `GET /wallet`, `POST /wallet/topup`, `POST /bookings` |
| `/bookings` | auth | **Bookings list.** Tabs: *Needs action*, *In progress*, *Closed*. For a creator, *Needs action* is requested and accepted bookings; for a brand, it is submitted bookings awaiting approval. Each row shows the other party, the price with its money state, the status and the deadline countdown. | `GET /bookings` |
| `/bookings/:id` | parties | **Booking detail.** Status timeline, brief, destination, deadline, and the actions allowed for the viewer's role in the current state: creator Accept/Decline, creator Submit post URL, creator copies the tracking link, brand Approve. It also shows click stats (total, unique, a small bar per day). A 409 shows as an inline message so the out-of-order refusal can be demonstrated. | `GET /bookings/:id`, `POST …/accept\|decline\|submit\|approve`, `GET …/stats` |
| `/wallet` | auth | **Wallet.** Available and held balances, top-up (brands only, preset amounts plus a custom field), the transactions table (type, booking link, ±amount, date), and a "Ledger reconciles" badge. | `GET /wallet`, `POST /wallet/topup`, `GET /wallet/transactions` |
| `/profile` | creator | **Edit profile.** A form on the left and the live `MarketplaceCard` preview on the right. | `GET /auth/me`, `PUT /creators/me/profile` |
| `*` | | Not found, with a link to the marketplace. | |

Deep links keep working on GitHub Pages through the existing `404.html` copy.

---

## 4. Build order and time

Each step ends with a working check and a commit (and a push once allowed).

We deploy right after auth works, not at the end. A deploy problem found on Saturday afternoon could leave nothing live. Once Render is connected to the repo, every later push redeploys automatically.

| # | Step | Done when | Time |
|---|---|---|---|
| 3 | Prisma schema, migration with CHECKs, auth routes, `requests.http` for auth | Signup creates the user and wallet (visible in Studio), login and `/auth/me` work, and the 400/401/409 cases pass | 1.5 h |
| 3b | **Deploy to Render** with auto-deploy on push | The live `/health` returns 200, and a live signup works against Neon | 30 min |
| 4 | Creator profile and listing, reliability query | A profile can be saved; listing, filters and sort work | 45 min |
| 5 | **Wallet and booking lifecycle in `escrow.ts`** | The full happy path works; decline refunds; out-of-order requests get 409; insufficient funds gets 409; `npm run check` passes | 2.5 h |
| 6 | Sweep job, tracking redirect with bot filter, stats | A late booking refunds itself; a browser click is counted and verifies a submitted post; a `LinkedInBot` request is redirected but neither counted nor paid | 1.5 h |
| 7 | Seed, run it against Neon | The live `/creators` returns seeded data, and every booking state exists | 45 min |
| ✓ | **Checkpoint: the backend is complete** | `requests.http` and `npm run check` pass against the live API. From here, the "real backend" requirement is met even if the frontend runs late | |
| 8a | Frontend foundation: `api`, `auth`, `AppHeader`, delete marketing pages, auth pages wired to the API | Signup and login work against the live API | 1.5 h |
| 8b | Marketplace, creator profile, new booking, wallet | A brand can browse, top up and book | 2 h |
| — | **Record the intro video (Saturday midday)** | Recorded, uploaded, sharing turned on. It takes about 20 minutes, so it isn't left for the end | 20 min |
| 8c | Bookings list, booking detail with timeline and actions, creator profile editor | The whole demo can be clicked through in the UI. If this runs late, simplify the booking detail page (status + actions, no chart) | 2 h |
| 9 | README (setup, live links, demo logins, Design Decisions, Known limitations), deploy the frontend, final checks | Checklist below is complete | 1 h |

**If time runs out,** cut in this order: fit explanation (not planned), stats chart (keep the plain number), reliability sort (keep the number), creator profile live preview. Nothing in `escrow.ts`, the booking actions or the wallet page gets cut.

---

## 5. Submission checklist

- [ ] Backend is live and `/health` returns 200
- [ ] Frontend on GitHub Pages talks to the live backend; no mock data (search for leftover hardcoded arrays)
- [ ] Seed covers every booking state
- [ ] `npm run check` passes against the live API
- [ ] No secrets in git: `git grep -nE "npg_|GEMINI|JWT_SECRET="` finds nothing
- [ ] README has setup, live links, demo logins, and Design Decisions written as "Naano does X, we did Y, because Z"
- [ ] README has a **Known limitations** section, so we name these before a reviewer finds them:
  - A click proves the link was shared, not that it's in the LinkedIn post. A creator could share it on WhatsApp and get paid. Brand approval and the 72-hour window are the real safeguards; checking the post itself would need LinkedIn API access.
  - The bot filter works on user agents, which can be faked.
  - The self-click check works on IP address, so a creator on another network can get around it.
  - The login token is kept in `localStorage` because the frontend and API are on different sites. With a shared domain, httpOnly cookies would be better.
  - Wallets hold demo money. Real card payments and payouts are out of scope.
- [ ] `.agent-logs/` is committed
- [ ] Open both free-tier apps just before submitting so they're awake
- [ ] Intro video recorded, sharing turned on, link submitted

---

## 6. Open questions

1. **The AI assistant (`AiBar` + worker).** It's built, and it's cheap to keep, but its prompt is written for naano's marketing site. Options: keep it and retune the prompt to help brands write briefs (which overlaps with the cut "AI brief writer"), or remove it for a cleaner scope. My lean is to remove it from the app, because it isn't part of the pitch.
2. **Demo logins in the README.** Confirm this is fine. They are required for a reviewer to click through, and they're not real credentials.
3. **Decisions 1 to 8 in section 1:** confirm these before step 5 starts.
