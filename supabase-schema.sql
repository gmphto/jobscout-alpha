-- JobScout Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prompts table (job posts submitted by users)
create table public.prompts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  content text not null, -- The job post content
  company text,
  position text,
  category text default 'general',
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Generated content table (AI-generated resume content)
create table public.generated_content (
  id uuid default uuid_generate_v4() primary key,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  
  -- Generated resume sections
  bullet_points jsonb, -- Array of tailored bullet points
  skills jsonb, -- Array of relevant skills
  keywords jsonb, -- Array of important keywords from job post
  achievements jsonb, -- Array of tailored achievements
  summary text, -- Tailored professional summary
  
  -- Metadata
  openai_model text default 'gpt-4o-mini',
  processing_time_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.prompts enable row level security;
alter table public.generated_content enable row level security;

-- RLS Policies for users table
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- RLS Policies for prompts table
create policy "Users can view own prompts" on public.prompts
  for select using (auth.uid() = user_id);

create policy "Users can create own prompts" on public.prompts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own prompts" on public.prompts
  for update using (auth.uid() = user_id);

create policy "Users can delete own prompts" on public.prompts
  for delete using (auth.uid() = user_id);

-- RLS Policies for generated_content table
create policy "Users can view own generated content" on public.generated_content
  for select using (auth.uid() = user_id);

create policy "Users can create own generated content" on public.generated_content
  for insert with check (auth.uid() = user_id);

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.prompts
  for each row execute procedure public.handle_updated_at();

-- Indexes for better performance
create index prompts_user_id_idx on public.prompts(user_id);
create index prompts_status_idx on public.prompts(status);
create index prompts_created_at_idx on public.prompts(created_at desc);
create index generated_content_prompt_id_idx on public.generated_content(prompt_id);
create index generated_content_user_id_idx on public.generated_content(user_id); 