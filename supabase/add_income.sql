-- Agar aap pehle hi purana schema.sql chala chuke hain, to sirf ye chalayein
-- (purane expenses jaisa ke taisa rahenge, type 'expense' ban jayega)

alter table expenses
  add column type text not null default 'expense'
  check (type in ('expense', 'income'));
