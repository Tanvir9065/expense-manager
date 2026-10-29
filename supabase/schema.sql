-- Naya setup: Supabase Dashboard -> SQL Editor mein ye chalayein
-- (Agar purana schema pehle chala chuke hain, to iske bajay add_income.sql chalayein)

create table expenses (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'expense' check (type in ('expense', 'income')),
  amount numeric not null,
  category text not null,
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Optional: dashboard ko tez rakhne ke liye
create index expenses_date_idx on expenses (date desc);

-- Agar aapne table Supabase ke Table Editor se banayi hai (RLS ON hota hai),
-- ya "RLS enabled" dikh raha hai, to ye policies chalayein taaki anon key se
-- read/insert/delete ho sake. SQL editor se banayi table mein RLS default OFF hoti hai,
-- tab iski zaroorat nahi.
--
-- alter table expenses enable row level security;
-- create policy "anon select" on expenses for select to anon using (true);
-- create policy "anon insert" on expenses for insert to anon with check (true);
-- create policy "anon delete" on expenses for delete to anon using (true);
