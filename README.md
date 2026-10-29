# Expense Tracker

Simple personal expense + income tracker: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase.

## Local setup

1. `npm install`
2. Supabase mein project banayein, phir SQL Editor mein `supabase/schema.sql` chalayein.
   (Agar purana schema pehle chala chuke hain, to sirf `supabase/add_income.sql` chalayein.)
3. `.env.example` ko copy karke `.env.local` banayein aur values bharein:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Keys: Supabase Dashboard -> Project Settings -> API (Project URL aur anon public key).
4. `npm run dev` -> http://localhost:3000

## Vercel deploy

1. Code GitHub repo pe push karein.
2. vercel.com -> Add New -> Project -> repo import karein.
3. Environment Variables mein dono keys add karein, phir Deploy.

## Pages

- `/` Dashboard: mahine ka total kharcha, income, bacha hua, category-wise kharcha, entries list, delete, prev/next month
- `/add` Naya expense ya income add karein
