-- Vidora Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- Profiles table (optional, extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Download history
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete set null,
  video_id text not null,
  title text not null,
  thumbnail text,
  format text not null check (format in ('mp4', 'mp3')),
  quality text not null, -- e.g. '1080p', '720p', 'mp3'
  url text not null,     -- original YouTube URL
  duration integer,      -- seconds
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists downloads_user_id_idx on public.downloads(user_id);
create index if not exists downloads_created_at_idx on public.downloads(created_at desc);
create index if not exists downloads_video_id_idx on public.downloads(video_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.downloads enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Downloads policies
create policy "Users can view own downloads"
  on public.downloads for select
  using (auth.uid() = user_id or user_id is null);

create policy "Anyone can insert downloads (anonymous allowed)"
  on public.downloads for insert
  with check (true);

create policy "Users can delete own downloads"
  on public.downloads for delete
  using (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
