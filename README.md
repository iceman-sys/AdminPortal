# OrthoticHub Admin Console

Read-only web console for reviewing assessments, recommendations, and orders.

## Setup

1. Copy `.env.example` to `.env.local` and fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never commit)
   - `ADMIN_EMAILS` — comma-separated staff emails allowed to sign in

2. Run the commerce migration in Supabase SQL Editor:

   `../supabase/migrations/0003_milestone3_commerce.sql`

3. Create a Supabase Auth user for each admin email (or use an existing test account listed in `ADMIN_EMAILS`).

4. Install and run:

```bash
cd admin
npm install
npm run dev
```

Open http://localhost:3001

## Deploy (Vercel)

- Set the same environment variables in the Vercel project.
- Root directory: `admin`
- Build command: `npm run build`

## Security

- Middleware requires a signed-in user whose email is in `ADMIN_EMAILS`.
- List pages use the **service role** on the server only (never exposed to the browser).
- This console is **read-only** (no rule editing, no order status changes from UI).

## Behavior

- **Home** redirects to `/dashboard`.
- List and dashboard data may be up to **30 seconds** stale (`ADMIN_REVALIDATE_SECONDS` in `lib/admin-cache.ts`).
- Use the header search for email, UUIDs, user id prefixes, or Stripe `pi_…` ids.
- Click a user id (short) on list pages to open the **case view** (`/users/[id]`).

## Routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | KPIs, 24h funnel, recent orders |
| `/assessments` | Intake list |
| `/assessments/[id]` | Intake detail + **foot scans** for assessment |
| `/recommendations` | Rules outcomes |
| `/orders` | Commerce |
| `/search` | Global lookup |
| `/users/[id]` | Per-user timeline + **foot scan gallery** |

## Out of scope (intentional)

- CSV / PDF export
- Case notes, tags, staff assignment
- Rules engine editor
- Changing order status or refunds from UI
- Real-time live updates beyond revalidate window
