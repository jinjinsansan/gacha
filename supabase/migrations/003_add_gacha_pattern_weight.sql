alter table public.gacha_patterns
  add column if not exists weight integer not null default 1;

update public.gacha_patterns
  set weight = coalesce(weight, 1);
