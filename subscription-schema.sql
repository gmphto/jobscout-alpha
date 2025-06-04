-- Subscription Management Schema
-- Run this AFTER the main supabase-schema.sql

-- Subscription plans table
create table public.subscription_plans (
  id text primary key,
  name text not null,
  description text,
  price_monthly integer not null, -- Price in cents
  price_yearly integer, -- Price in cents, nullable for free plan
  prompt_limit integer, -- null means unlimited
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  features jsonb default '[]',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User subscriptions table
create table public.user_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan_id text references public.subscription_plans(id) not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active' check (status in ('active', 'inactive', 'canceled', 'past_due')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one active subscription per user
  unique(user_id, status) where status = 'active'
);

-- Usage tracking table
create table public.user_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  month_year text not null, -- Format: 'YYYY-MM'
  prompts_used integer default 0,
  prompts_limit integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Unique constraint for user per month
  unique(user_id, month_year)
);

-- Set up Row Level Security
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_usage enable row level security;

-- RLS Policies for subscription_plans (publicly readable)
create policy "Plans are publicly readable" on public.subscription_plans
  for select using (is_active = true);

-- RLS Policies for user_subscriptions
create policy "Users can view own subscription" on public.user_subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can update own subscription" on public.user_subscriptions
  for update using (auth.uid() = user_id);

-- RLS Policies for user_usage
create policy "Users can view own usage" on public.user_usage
  for select using (auth.uid() = user_id);

create policy "Users can update own usage" on public.user_usage
  for update using (auth.uid() = user_id);

create policy "Users can insert own usage" on public.user_usage
  for insert with check (auth.uid() = user_id);

-- Insert default subscription plans
insert into public.subscription_plans (id, name, description, price_monthly, price_yearly, prompt_limit, features) values
  ('free', 'Free', 'Perfect for trying out JobScout', 0, null, 5, '["5 AI-generated resume contents", "Basic resume tailoring", "Email support"]'),
  ('pro', 'Pro', 'For serious job seekers', 997, 9970, null, '["Unlimited AI-generated content", "Advanced resume tailoring", "Priority support", "Export to multiple formats", "Resume templates"]'),
  ('premium', 'Premium', 'For recruiters and career coaches', 2997, 29970, null, '["Everything in Pro", "Team collaboration", "Analytics dashboard", "White-label options", "Custom integrations"]');

-- Function to get current month usage
create or replace function public.get_user_current_usage(user_uuid uuid)
returns table(prompts_used integer, prompts_limit integer, can_create_prompt boolean) as $$
declare
  current_month text := to_char(now(), 'YYYY-MM');
  usage_record record;
  subscription_record record;
  plan_record record;
begin
  -- Get user's current subscription
  select * into subscription_record 
  from public.user_subscriptions 
  where user_id = user_uuid and status = 'active';
  
  -- If no subscription, treat as free plan
  if subscription_record is null then
    select * into plan_record from public.subscription_plans where id = 'free';
  else
    select * into plan_record from public.subscription_plans where id = subscription_record.plan_id;
  end if;
  
  -- Get or create usage record for current month
  select * into usage_record 
  from public.user_usage 
  where user_id = user_uuid and month_year = current_month;
  
  if usage_record is null then
    insert into public.user_usage (user_id, month_year, prompts_used, prompts_limit)
    values (user_uuid, current_month, 0, plan_record.prompt_limit)
    returning * into usage_record;
  end if;
  
  -- Return usage information
  return query select 
    usage_record.prompts_used,
    usage_record.prompts_limit,
    (usage_record.prompts_limit is null or usage_record.prompts_used < usage_record.prompts_limit) as can_create_prompt;
end;
$$ language plpgsql security definer;

-- Function to increment usage
create or replace function public.increment_user_usage(user_uuid uuid)
returns boolean as $$
declare
  current_month text := to_char(now(), 'YYYY-MM');
  usage_record record;
begin
  -- Get current usage
  select * into usage_record 
  from public.user_usage 
  where user_id = user_uuid and month_year = current_month;
  
  -- Check if user can create prompt
  if usage_record.prompts_limit is not null and usage_record.prompts_used >= usage_record.prompts_limit then
    return false;
  end if;
  
  -- Increment usage
  update public.user_usage 
  set prompts_used = prompts_used + 1, updated_at = now()
  where user_id = user_uuid and month_year = current_month;
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to handle new user subscription (creates free plan by default)
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.user_subscriptions (user_id, plan_id, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create free subscription for new users
create trigger on_user_created_subscription
  after insert on public.users
  for each row execute procedure public.handle_new_user_subscription();

-- Triggers for updated_at
create trigger handle_updated_at before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.user_usage
  for each row execute procedure public.handle_updated_at();

-- Indexes for performance
create index user_subscriptions_user_id_idx on public.user_subscriptions(user_id);
create index user_subscriptions_status_idx on public.user_subscriptions(status);
create index user_usage_user_id_month_idx on public.user_usage(user_id, month_year);
create index user_usage_month_year_idx on public.user_usage(month_year); 