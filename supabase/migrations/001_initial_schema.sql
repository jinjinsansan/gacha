-- Enable required extensions -------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Users ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  deposit_address text unique not null,
  balance numeric(18,6) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gacha patterns -------------------------------------------------------------
create table if not exists public.gacha_patterns (
  id integer primary key,
  currency varchar(10) not null,
  machine_color varchar(20) not null,
  effect_1 varchar(20) not null,
  effect_2 varchar(20) not null,
  base_result boolean not null,
  video_url varchar(500) not null,
  prize_amount numeric(18,6) not null
);

-- Transactions ---------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type varchar(20) not null,
  amount numeric(18,6) not null,
  tx_hash varchar(100),
  wallet_address varchar(100),
  status varchar(20) not null default 'PENDING',
  created_at timestamptz not null default now()
);

-- Gacha history --------------------------------------------------------------
create table if not exists public.gacha_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  pattern_id integer not null references public.gacha_patterns (id),
  final_result boolean not null,
  rtp_at_play integer not null,
  prize_amount numeric(18,6) not null default 0,
  played_at timestamptz not null default now()
);

-- Campaign codes -------------------------------------------------------------
create table if not exists public.campaign_codes (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null unique,
  plays_granted integer not null default 1,
  max_uses integer not null default 100,
  current_uses integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Code redemptions -----------------------------------------------------------
create table if not exists public.code_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  code_id uuid not null references public.campaign_codes (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (user_id, code_id)
);

-- System settings ------------------------------------------------------------
create table if not exists public.system_settings (
  key varchar(50) primary key,
  value varchar(500) not null,
  updated_at timestamptz not null default now()
);

-- Admin users ----------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  role varchar(20) not null default 'admin',
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Helpful indexes ------------------------------------------------------------
create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_gacha_history_user_id on public.gacha_history (user_id);
create index if not exists idx_gacha_history_pattern_id on public.gacha_history (pattern_id);
create index if not exists idx_code_redemptions_user_id on public.code_redemptions (user_id);
create index if not exists idx_campaign_codes_active on public.campaign_codes (is_active, expires_at);

-- Row Level Security ---------------------------------------------------------
alter table public.users enable row level security;
alter table public.gacha_patterns enable row level security;
alter table public.transactions enable row level security;
alter table public.gacha_history enable row level security;
alter table public.campaign_codes enable row level security;
alter table public.code_redemptions enable row level security;
alter table public.system_settings enable row level security;
alter table public.admin_users enable row level security;

-- Users policies
drop policy if exists "Users view own profile" on public.users;
create policy "Users view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Service role manages users" on public.users;
create policy "Service role manages users"
  on public.users for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Gacha patterns policies
drop policy if exists "Service role manages patterns" on public.gacha_patterns;
create policy "Service role manages patterns"
  on public.gacha_patterns for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Transactions policies
drop policy if exists "Users view own transactions" on public.transactions;
create policy "Users view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages transactions" on public.transactions;
create policy "Service role manages transactions"
  on public.transactions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Gacha history policies
drop policy if exists "Users view own history" on public.gacha_history;
create policy "Users view own history"
  on public.gacha_history for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages history" on public.gacha_history;
create policy "Service role manages history"
  on public.gacha_history for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Campaign codes policies
drop policy if exists "Service role manages campaign codes" on public.campaign_codes;
create policy "Service role manages campaign codes"
  on public.campaign_codes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Code redemptions policies
drop policy if exists "Users view own redemptions" on public.code_redemptions;
create policy "Users view own redemptions"
  on public.code_redemptions for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages redemptions" on public.code_redemptions;
create policy "Service role manages redemptions"
  on public.code_redemptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- System settings policies
drop policy if exists "Service role manages settings" on public.system_settings;
create policy "Service role manages settings"
  on public.system_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Admin users policies
drop policy if exists "Service role manages admins" on public.admin_users;
create policy "Service role manages admins"
  on public.admin_users for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
