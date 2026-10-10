create extension if not exists pgcrypto;

create table if not exists trust_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text,
  member_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists fundraising_cycles (
  id uuid primary key default gen_random_uuid(),
  fundraising_year int not null,
  monthly_member_contribution numeric(12,2) not null check (monthly_member_contribution > 0),
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fundraising_cycles_valid_range check (end_date >= start_date)
);

create table if not exists member_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  fundraising_year int not null,
  payment_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_reference text not null,
  payment_method text not null default 'bank-transfer',
  notes text,
  status text not null default 'active' check (status in ('active', 'reversed')),
  reversed_at timestamptz,
  reversal_reason text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists external_donors (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  anonymous boolean not null default false,
  amount numeric(12,2) not null check (amount > 0),
  donation_date date not null,
  payment_method text not null,
  transaction_reference text,
  notes text,
  status text not null default 'active' check (status in ('active', 'reversed')),
  reversed_at timestamptz,
  reversal_reason text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists disbursements (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  disbursement_date date not null,
  purpose text not null,
  payment_method text not null,
  receipt_url text,
  notes_private text,
  status text not null default 'active' check (status in ('active', 'reversed')),
  reversed_at timestamptz,
  reversal_reason text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opening_balances (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12,2) not null,
  effective_date date not null,
  description text not null,
  status text not null default 'active' check (status in ('active', 'reversed', 'reconciled')),
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

alter table members enable row level security;
alter table fundraising_cycles enable row level security;
alter table member_payments enable row level security;
alter table external_donors enable row level security;
alter table disbursements enable row level security;
alter table opening_balances enable row level security;
alter table admin_users enable row level security;
alter table audit_logs enable row level security;

create policy "public members are readable" on members
for select using (true);

create policy "public fundraising cycles are readable" on fundraising_cycles
for select using (true);

create policy "public donor names are hidden only when anonymous" on external_donors
for select using (
  anonymous = false or auth.uid() is not null
);

create policy "public disbursement records are private" on disbursements
for select using (false);

create policy "public opening balance is visible as historical total" on opening_balances
for select using (true);

create policy "admin users manage member data" on members
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users manage campaigns" on fundraising_cycles
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users manage member payments" on member_payments
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users manage external donors" on external_donors
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users manage disbursements" on disbursements
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users manage opening balances" on opening_balances
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users manage admin list" on admin_users
for all using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and role = 'super_admin' and is_active = true
  )
) with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and role = 'super_admin' and is_active = true
  )
);

create policy "admin users view audit logs" on audit_logs
for select using (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create policy "admin users insert audit logs" on audit_logs
for insert with check (
  exists (
    select 1 from admin_users where user_id = auth.uid() and is_active = true
  )
);

create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid() and is_active = true
  );
$$ language sql stable security definer;

create or replace function public.assert_admin()
returns void as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized. Administrator access required.';
  end if;
end;
$$ language plpgsql security definer;

create or replace view public.public_financial_summary as
select
  (select coalesce(sum(amount), 0) from public.opening_balances where status in ('active', 'reconciled')) as opening_balance,
  (select coalesce(sum(amount), 0) from public.member_payments where status = 'active') as member_contributions,
  (select coalesce(sum(amount), 0) from public.external_donors where status = 'active' and anonymous = false) as external_donations,
  (select coalesce(sum(amount), 0) from public.disbursements where status = 'active') as disbursements;

-- Simple storage used by the app: one JSON document holds members, payments,
-- donations and disbursements (fine for ~100 users). Accessed server-side only
-- with the service role key, so RLS is enabled with no public policies.
create table if not exists app_state (
  id int primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table app_state enable row level security;
