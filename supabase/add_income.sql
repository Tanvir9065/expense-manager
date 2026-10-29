-- Already ran the older schema? Run only this.
-- Existing rows stay as they are and become type 'expense'.

alter table expenses
  add column type text not null default 'expense'
  check (type in ('expense', 'income'));
