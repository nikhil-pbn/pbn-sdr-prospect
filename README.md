# PbN Prospects

Internal tool for the SDR team. After an outbound call, the SDR enters who they
spoke with, picks either the **solutions** the prospect asked about or the
**pain points** they raised, and generates a prospect page assembled from
**predefined sections**. Adjust the call to action, publish, share the link.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Google OAuth ·
Prisma 7 · PostgreSQL

**There is no AI anywhere in this application.** "Generate" is a deterministic
lookup: each selected category or pain point resolves to one predefined
section, and the page is `Header → Hero → [selected sections, in
sortOrder] → Testimonials → CTA`. No model, no prompts, no transcripts.

The product, auth and publishing philosophy mirror **PbN Proposals**
(`../pbn-sales-proposal`). The page design comes from the supplied prospect
template; its hero, stats and testimonials are the PbN Voice site's
(`../pbn-voice`).

---

## Status: all 5 steps done

| Step | Scope                                                              | State    |
| ---- | ------------------------------------------------------------------ | -------- |
| 1    | Google auth, protected home, selection form, validation            | done     |
| 2    | Postgres/Prisma schema, section mapping, generate, editor, publish | done     |
| 3    | HubSpot + SDR tracking after publish                               | done     |
| 4    | My Prospects, All Prospects (admin)                                | done     |
| 5    | First-party analytics                                              | **done** |

---

## Getting started

The database is a **local Postgres container**, defined in
[`docker-compose.yml`](docker-compose.yml). Docker Desktop must be running.

```bash
npm install                # postinstall generates the Prisma client
cp .env.example .env       # then fill in the secrets — see the table below

npm run db:up              # start Postgres (first run downloads postgres:18)
npm run db:deploy          # apply the migrations

npm run dev                # http://localhost:3000
```

You will be asked to sign in with Google before you see anything. Only
`@practicenumbers.com` accounts are accepted.

## Environment variables

| Variable                         | Purpose                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`            | Public origin; builds the OAuth redirect URI and the shareable link            |
| `GOOGLE_CLIENT_ID` / `_SECRET`   | OAuth client (Web application, Internal consent screen)                        |
| `SESSION_SECRET`                 | Signs the session cookie. `openssl rand -base64 32`                            |
| `ADMIN_EMAILS`                   | Comma-separated admins. Empty = nobody.                                        |
| `SDR_ACCESS_EMAILS`              | Comma-separated SDRs who may create prospects. Empty = admins only             |
| `DATABASE_URL` / `DIRECT_URL`    | Postgres. Same value locally; pooled vs direct on a managed host               |
| `HUBSPOT_ACCESS_TOKEN`           | Optional. Private-app token (`pat-…`), server-side only                        |
| `HUBSPOT_PROSPECT_LINK_PROPERTY` | Optional. Contact property the link is written to. Default `sdr_prospect_link` |

Details are in [`.env.example`](.env.example). The SDR **roster** — names and
calendar links — is a constant in [`src/utils/sdr-roster.ts`](src/utils/sdr-roster.ts),
not an env var.

## Scripts

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Dev server                                 |
| `npm run build`        | Production build                           |
| `npm run vercel-build` | `prisma migrate deploy && next build`      |
| `npm run typecheck`    | `tsc --noEmit`                             |
| `npm run lint`         | ESLint                                     |
| `npm run format`       | Prettier, write (`format:check` to verify) |
| `npm run db:up`        | Start the Postgres container               |
| `npm run db:down`      | Stop it, keeping the data                  |
| `npm run db:migrate`   | `prisma migrate dev` — new migration       |
| `npm run db:deploy`    | `prisma migrate deploy` — apply migrations |
| `npm run db:check`     | Counts and the latest prospects            |
| `npm run db:studio`    | Prisma Studio                              |

---

## How a prospect is built

```
SDR form ─► generateProspect (Server Action)
              ├─ session → owner_email, owner_name        (never from the form)
              ├─ selected slugs → catalog entries               (unknown → field error)
              ├─ slug: prospect-<name>-<6 random>
              ├─ CTA defaults + the SDR's calendar link
              └─ INSERT prospects (selections = the slugs, in catalog order)
                    ─► redirect /editor/[id]
```

Section content is **never copied**. A prospect stores the slugs it chose; the
page looks each one up in the catalog (code, not a table) at render time and
orders them by the entry's `sortOrder`. Fixing a section fixes every prospect.

The **editor** edits the CTA only (title, description, button text, calendar
link) and previews the exact page with the same renderer the public route uses.
**Publish** flips `status`; the public page renders only when Published.

The **public page** `/[slug]` needs no login. The root catch-all rejects any
path without the `prospect-` prefix before touching the database.

## After publish: HubSpot and SDR tracking

```
Publish ─► link is live ─► HubSpot popup ─► write link to the contact
                                 │                    (skip = nothing written)
                                 └──────────► Tracking popup ─► Save ─► complete
```

One sequence, `usePublishFlow`, shared by the editor toolbar and both list
pages, so a Publish button in a table can never skip the two dialogs.

- **HubSpot.** Only when `HUBSPOT_ACCESS_TOKEN` is set. The prospect's contact
  comes from the optional _HubSpot contact URL_ on the form (only the record id
  is stored); if none was given the dialog asks for it. "Yes" PATCHes one
  property (`sdr_prospect_link`) on that contact — never a create, never a search —
  and records `hubspot_status` Added / Failed plus the failure reason, which the
  lists show. The token is read only inside the Server Action.
- **Tracking.** Always. Cannot be dismissed without saving. Prefilled with the
  SDR, prospect name and email; saving upserts the `prospect_tracking` row and
  stamps `tracking_confirmed_at`. A row is first written at generation, so the
  log is one row per prospect, never two.
- Both can be reopened later from the editor toolbar (Tracking, HubSpot) or the
  HubSpot button on a published row.

## Analytics

`/analytics` (admin only) mirrors PbN Proposals' analytics, first-party and with
no third-party SDK. The public page mounts one client component, the tracker,
which reports to `POST /api/analytics/event`:

| Event       | When                                    | Transport      |
| ----------- | --------------------------------------- | -------------- |
| `View`      | page open (once per load)               | fetch          |
| `Heartbeat` | every 20s; carries visible reading time | fetch / beacon |
| `Click`     | any element with `data-analytics-click` | beacon         |
| `Closed`    | `pagehide` — tab closed or navigated    | beacon         |

- **One row per visit** (`prospect_analytics_events`, upserted in a single
  `INSERT … ON CONFLICT` so bursts of clicks cannot race). Anonymous visitor and
  visit ids are httpOnly cookies this server issues; nothing is derived from IP
  or fingerprints. **Signed-in staff are refused at ingestion**, so an SDR
  proofreading their own page leaves no trace.
- **Metrics:** views, unique views (distinct visitors), time spent (active tab
  only), average per visit, clicks. Shared SQL fragment, so every breakdown
  agrees.
- **Breakdowns:** by prospect (paginated, opens `/analytics/[id]` with top
  clicked actions and returning visitors), by SDR, over time
  (day / week / month buckets chosen from the range).
- **Date filter:** All time, Today, Yesterday, Last 7 / 14 / 30 days, This /
  Last week (Mon–Sun), This / Last month, This year, Custom range. IST civil
  days, half-open intervals. Every link carries the range, view and sort.
- **Live:** "N prospects open now" polls `GET /api/analytics/active` every 15s
  and lists who is reading what. The dashboard also re-renders its own numbers
  every 15s while the tab is visible, so a new view or click shows up without a
  reload.

## Access control

There is no middleware/proxy. Every page checks for itself, and **every Server
Action checks again**.

| Gate                   | Grants                                             |
| ---------------------- | -------------------------------------------------- |
| Signed in with Google  | See the internal pages                             |
| `@practicenumbers.com` | Enforced by Google, then re-checked                |
| On `SDR_ACCESS_EMAILS` | Create prospects, and edit / publish **their own** |
| Owner of that prospect | Save CTA, publish, unpublish (`owner_email`)       |
| On `ADMIN_EMAILS`      | Everything above on any prospect                   |

Another SDR's prospect opens read-only in the editor; the actions refuse writes.

### Routes

| Route                           | Who                                       |
| ------------------------------- | ----------------------------------------- |
| `/`                             | SDR team — the prospect form (Create)     |
| `/my-prospects`                 | SDR team — their own prospects            |
| `/all-prospects`                | **Admins only** — every prospect          |
| `/analytics`, `/analytics/[id]` | **Admins only** — engagement dashboard    |
| `/api/analytics/event`          | **Public** — the tracker's ingestion      |
| `/api/analytics/active`         | Admins only — live presence count         |
| `/editor/[id]`                  | SDR team; writes limited to owner / admin |
| `/[slug]`                       | **Public** — the prospect page            |
| `/api/auth/google/*`            | OAuth start and callback                  |

---

## Database

```
prospects             slug · owner_email · owner_name · name · email · prospect_role · mode
                      selections TEXT[] (catalog slugs, in catalog order)
                      status · cta_* · version · published_at · last_viewed_at
                      hubspot_contact_id · hubspot_status · hubspot_synced_at · hubspot_error
                      tracking_confirmed_at
prospect_tracking     sdr_name · prospect_name · prospect_email · prospect_url · created_at
                      (no foreign key — survives a prospect being removed)
prospect_analytics_events
                      prospect_id · visitor_id · session_id · views · active_ms · actions JSONB
                      last_beat_seq · closed_at · created_at · last_seen_at
                      (one row per visit; unique on session_id + prospect_id; no foreign key)
```

Each catalog entry's `content` is structured JSON validated by `sectionContentSchema`
([`src/types/section-content.ts`](src/types/section-content.ts)): a header
(eyebrow, title, subtitle) and an ordered list of **blocks** — `text`,
`inline` (pipe- or bullet-separated line), `tiles` (See / Understand / Act),
`grid` (the two-column capabilities table) and `bullets` — each with its own
heading. The layout of a card is therefore data: the standard card and the
All-in-One card differ only in their block lists.

The **catalog is code**, not tables: [`src/content/catalog/`](src/content/catalog/)
holds one file per category under `categories/` and one per pain point under
`pain-points/` (all ten transcribed from the supplied cards), validated once
when the server starts. Edit a file and deploy; there is no seed step. A
prospect stores the slugs it chose, so an entry a prospect may have used is
**retired** (`retired: true`, which hides it from the form) and never deleted
or renamed. A section whose copy is not final carries a visible
`[Copy pending]` marker.

## Layout

```
src/
├── app/
│   ├── page.tsx              the gated prospect form
│   ├── [slug]/               the public prospect page
│   ├── editor/[id]/          the CTA editor with live preview
│   ├── my-prospects/         the SDR's own list · all-prospects/  the admin directory
│   ├── analytics/            the dashboard · analytics/[id]/  one prospect's engagement
│   └── api/                  auth/google/ (OAuth) · analytics/event · analytics/active
├── components/
│   ├── prospect/             the page: header, hero, stats, section cards, testimonials, CTA
│   ├── editor/               toolbar, CTA form, summary, HubSpot + tracking dialogs
│   ├── prospects/            the two tables, row actions, publish-flow provider
│   ├── analytics/            tracker, range filter, view tabs, summary cards, breakdown tables
│   ├── home/                 the form and its fields, recent prospects
│   ├── auth/ · brand/ · notices/ · ui/
├── content/                  static hero, stats, testimonials, CTA defaults · catalog/ (categories, pain points)
├── hooks/                    editor state, publish flow, the page tracker
├── lib/                      selection modes, cn()
├── server/
│   ├── auth/                 Google OAuth, session cookie, admin and SDR lists
│   ├── prospect/             actions, create, queries, listing, mutations, hubspot-sync
│   ├── hubspot/              private-app token (server-only), contact property PATCH
│   ├── tracking/             the SDR tracking log
│   ├── analytics/            ingestion (visitor cookies, one-row-per-visit upsert), queries, gate
│   ├── validation/           Zod schemas (form input, CTA, analytics event)
│   └── db/                   Prisma singleton, inspect
├── types/                    section content schema, page content
└── utils/                    URLs, SDR roster, date ranges (IST), sorting, pagination
```

Conventions: files under ~150 lines where practical, a route's `page.tsx` holds
its metadata and default export only, comments explain _why_.
