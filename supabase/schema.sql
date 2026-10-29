-- New setup: run this in Supabase Dashboard -> SQL Editor
-- (If you already ran the older schema, run add_income.sql instead)

create table expenses (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'expense' check (type in ('expense', 'income')),
  amount numeric not null,
  category text not null,
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Optional: keeps the dashboard fast
create index expenses_date_idx on expenses (date desc);

-- If you created the table from the Table Editor (RLS is ON by default there),
-- run these policies so the anon key can read, insert and delete.
-- Tables created from the SQL editor have RLS OFF, so this is not needed.
--
-- alter table expenses enable row level security;
-- create policy "anon select" on expenses for select to anon using (true);
-- create policy "anon insert" on expenses for insert to anon with check (true);
-- create policy "anon delete" on expenses for delete to anon using (true);
