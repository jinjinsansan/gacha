alter table public.transactions
  add column if not exists gacha_history_id uuid references public.gacha_history(id);

create index if not exists idx_transactions_gacha_history_id
  on public.transactions (gacha_history_id);
