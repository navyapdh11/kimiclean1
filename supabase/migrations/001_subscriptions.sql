-- Subscription tiers table
create table public.subscription_tiers (
  id text primary key,
  name text not null,
  stripe_price_id text not null unique,
  monthly_price integer not null,
  features jsonb not null default '[]',
  created_at timestamptz default now()
);

-- User subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  tier_id text references public.subscription_tiers not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique not null,
  status text check (status in ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  idempotency_key text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email logs for audit trail
create table public.email_logs (
  id uuid default gen_random_uuid() primary key,
  recipient text not null,
  subject text not null,
  resend_id text,
  status text not null,
  sent_at timestamptz default now()
);

-- Failed emails queue
create table public.failed_emails (
  id uuid default gen_random_uuid() primary key,
  recipient text not null,
  subject text not null,
  error text not null,
  retry_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.subscriptions enable row level security;
alter table public.email_logs enable row level security;
alter table public.failed_emails enable row level security;

-- Policies
create policy "Users view own subscription"
on public.subscriptions for select
to authenticated
using (auth.uid() = user_id);

create policy "Users update own subscription"
on public.subscriptions for update
to authenticated
using (auth.uid() = user_id);

-- Indexes
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);
create index idx_subscriptions_status on public.subscriptions(status);

-- Insert default tiers (run after creating products in Stripe)
insert into public.subscription_tiers (id, name, stripe_price_id, monthly_price, features) values
('starter', 'Starter Clean', 'price_starter_placeholder', 9900, '["2 cleanings/month", "Basic 3D preview", "Email support"]'::jsonb),
('pro', 'Pro Shine', 'price_pro_placeholder', 29900, '["8 cleanings/month", "Full WebXR tours", "Priority booking", "SMS alerts"]'::jsonb),
('enterprise', 'Enterprise Kimi', 'price_enterprise_placeholder', 99900, '["Unlimited cleanings", "Custom 3D models", "Dedicated account manager", "API access"]'::jsonb);
