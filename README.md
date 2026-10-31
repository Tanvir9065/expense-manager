# Expense Tracker

A personal expense and income tracker built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase.

Features: PIN lock, add / edit / delete (with undo), monthly budget, 6-month trend, search and filters,
recurring entries, custom categories, CSV export, dark mode (follows your device setting).

## How it works

The browser never talks to Supabase directly. It calls this app's own `/api` routes, which check a
PIN-based session cookie and then talk to Supabase from the server using the service role key.
Row Level Security is turned on with no public policies, so the public anon key cannot read or write anything.

## Environment variables

| Name | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key from Supabase (Project Settings -> API). Server only, never share it. |
| `APP_PIN` | The PIN (or password) you type to unlock the app |
| `AUTH_SECRET` | Long random text used to sign the session cookie. Generate: `openssl rand -hex 32` |

Changing `APP_PIN` or `AUTH_SECRET` signs you out everywhere.

## Local setup

1. `npm install`
2. In Supabase, open SQL Editor and run `supabase/setup.sql` (safe to run again).
3. Copy `.env.example` to `.env.local` and fill in the four values above.
4. `npm run dev` and open http://localhost:3000

## Deploy to Vercel

1. Push the code to GitHub.
2. In Vercel, import the repo and add the four environment variables.
3. Deploy. After changing environment variables later, redeploy.

## Offline use

A service worker (`public/sw.js`, production only) saves the pages and data you have opened.
Offline you can still open the app and see what you last saw. Adding, editing and deleting need a connection.
Signing out removes the saved pages and data from the device.

## Pages

- `/` Dashboard: spent, income, balance, budget, last 6 months, categories, transactions
- `/add` and `/edit/[id]` Add or edit an entry
- `/recurring` Entries that repeat every month (rent, subscriptions, salary)
- `/settings` Budget, categories, CSV export, sign out
