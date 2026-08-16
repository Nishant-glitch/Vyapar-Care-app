-- =====================================================================
-- Vyapar Care — database schema
-- Supabase SQL editor me poori file paste karke run kar dijiye.
-- Dobara run karna safe hai (IF NOT EXISTS / DROP IF EXISTS use kiya hai).
-- =====================================================================

-- gen_random_uuid() ke liye (Supabase pe already enabled hota hai)
create extension if not exists pgcrypto;

-- =====================================================================
-- users — auth.users ka public profile
-- =====================================================================
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  phone       text unique,
  name        text,
  -- "VCC" + 7 random digits, e.g. VCC2505181
  customer_id text unique not null
              default 'VCC' || lpad(floor(random() * 10000000)::text, 7, '0'),
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- services — catalogue (app ki Services list isi se aayegi)
-- =====================================================================
create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  detail_title    text,
  description     text,
  fee             integer not null,
  advance_percent integer not null default 50,
  processing_days text,
  icon            text,
  included        text[] not null default '{}',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- orders
-- =====================================================================
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  -- "VCC" + timestamp, e.g. VCC250502103015
  order_id   text unique not null
             default 'VCC' || to_char(now(), 'YYMMDDHH24MISS'),
  status     text not null default 'pending'
             check (status in ('pending', 'processing', 'verification', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

-- =====================================================================
-- payments
-- =====================================================================
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  amount         integer not null,
  type           text not null check (type in ('advance', 'final')),
  method         text,
  transaction_id text,
  status         text not null default 'pending'
                 check (status in ('success', 'failed', 'pending')),
  created_at     timestamptz not null default now()
);

create index if not exists payments_order_id_idx on public.payments (order_id);

-- =====================================================================
-- documents
-- =====================================================================
create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  name       text not null,
  file_url   text,
  status     text not null default 'pending'
             check (status in ('pending', 'uploaded', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists documents_order_id_idx on public.documents (order_id);

-- =====================================================================
-- notifications
-- =====================================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  title       text not null,
  description text,
  type        text not null default 'info'
              check (type in ('success', 'info', 'payment', 'action')),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, created_at desc);

-- =====================================================================
-- naya auth user bante hi public.users row bana do
-- (customer_id default se auto-generate hota hai)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security — har user sirf apna data dekhe
-- =====================================================================
alter table public.users         enable row level security;
alter table public.services      enable row level security;
alter table public.orders        enable row level security;
alter table public.payments      enable row level security;
alter table public.documents     enable row level security;
alter table public.notifications enable row level security;

-- users: apna hi profile
drop policy if exists "users read own" on public.users;
create policy "users read own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users update own" on public.users;
create policy "users update own" on public.users
  for update using (auth.uid() = id);

-- services: catalogue sabke liye readable (sirf active)
drop policy if exists "services readable" on public.services;
create policy "services readable" on public.services
  for select using (is_active);

-- orders: apne orders
drop policy if exists "orders read own" on public.orders;
create policy "orders read own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own" on public.orders
  for insert with check (auth.uid() = user_id);

-- payments: apne order ke payments
drop policy if exists "payments read own" on public.payments;
create policy "payments read own" on public.payments
  for select using (
    exists (select 1 from public.orders o where o.id = payments.order_id and o.user_id = auth.uid())
  );

drop policy if exists "payments insert own" on public.payments;
create policy "payments insert own" on public.payments
  for insert with check (
    exists (select 1 from public.orders o where o.id = payments.order_id and o.user_id = auth.uid())
  );

-- documents: apne order ke documents
drop policy if exists "documents read own" on public.documents;
create policy "documents read own" on public.documents
  for select using (
    exists (select 1 from public.orders o where o.id = documents.order_id and o.user_id = auth.uid())
  );

drop policy if exists "documents update own" on public.documents;
create policy "documents update own" on public.documents
  for update using (
    exists (select 1 from public.orders o where o.id = documents.order_id and o.user_id = auth.uid())
  );

-- notifications: apni notifications
drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (auth.uid() = user_id);
