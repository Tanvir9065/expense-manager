-- Run this in Supabase Dashboard -> SQL Editor.
-- Safe to run more than once, and works for both new and existing setups.

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'expense' check (type in ('expense', 'income')),
  amount numeric not null,
  category text not null,
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Older installs: add the columns that were introduced later
alter table expenses add column if not exists type text not null default 'expense' check (type in ('expense', 'income'));
alter table expenses add column if not exists recurring_id uuid;

create table if not exists recurring (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'expense' check (type in ('expense', 'income')),
  amount numeric not null check (amount > 0),
  category text not null,
  note text,
  day_of_month int not null check (day_of_month between 1 and 31),
  start_date date not null,
  last_run date,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

create index if not exists expenses_date_idx on expenses (date desc);

-- Stops the same recurring entry from being created twice
create unique index if not exists expenses_recurring_unique on expenses (recurring_id, date);

-- Lock the tables down. The app now reaches the database only through its own
-- server (using the service role key), so the public anon key gets no access.
alter table expenses enable row level security;
alter table recurring enable row level security;
alter table settings enable row level security;

drop policy if exists "anon select" on expenses;
drop policy if exists "anon insert" on expenses;
drop policy if exists "anon delete" on expenses;
