# AK Trust

Donation-tracking site: public dashboard (overview, members, donors, disbursements) and an admin area to add/delete members and record payments, donations and disbursements.

## Run
```bash
npm install
npm run dev   # http://localhost:3000
npm test
```
With no env vars it runs in demo mode: data in `data/db.json`, admin password `akadmin123`. The 21 members are seeded on first load.

## Going live (Supabase)
1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` and `AUTH_SECRET`.
