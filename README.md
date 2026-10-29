# Expense Tracker

A simple personal expense and income tracker built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase.

## Local setup

1. `npm install`
2. Create a Supabase project, then run `supabase/schema.sql` in the SQL Editor.
   (If you already ran the older schema, run only `supabase/add_income.sql`.)
3. Copy `.env.example` to `.env.local` and fill in the values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Find both in Supabase Dashboard -> Project Settings -> API.
4. `npm run dev` and open http://localhost:3000

## Deploy to Vercel

1. Push the code to GitHub.
2. On vercel.com choose Add New -> Project and import the repo.
3. Add both environment variables, then click Deploy.

## Pages

- `/` Dashboard: monthly spend, income, balance, spending by category, transactions, delete, previous/next month
- `/add` Add an expense or income entry
