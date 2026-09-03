-- Vidora Supabase Schema (Locked Down)
-- Run this in your Supabase SQL Editor
-- Safe to re-run: drops old policies before recreating

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Download history
-- user_id is required (no anonymous rows)
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  video_id text not null,
  title text not null,
  thumbnail text,
  format text not null check (format in ('mp4', 'mp3')),
  quality text not null,  -- e.g. '1080p', '720p', 'mp3'
  url text not null,      -- original YouTube URL
  duration integer,       -- seconds
  created_at timestamptz default now() not null
);

-- If the table already existed with nullable user_id, tighten it:
-- (run only if you previously allowed nulls and have no orphan rows)
do $$
begin
  -- make user_id NOT NULL if it currently allows null
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'downloads'
      and column_name = 'user_id'
      and is_nullable = 'YES'
  ) then
    -- optional: delete any orphan/anonymous rows first
    delete from public.downloads where user_id is null;
    alter table public.downloads alter column user_id set not null;
  end if;
end $$;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists downloads_user_id_idx on public.downloads(user_id);
create index if not exists downloads_created_at_idx on public.downloads(created_at desc);
create index if not exists downloads_video_id_idx on public.downloads(video_id);

-- ============================================================
-- ROW LEVEL SECURITY (strict)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.downloads enable row level security;

-- Force RLS even for table owners
alter table public.profiles force row level security;
alter table public.downloads force row level security;

-- ----------------------------------------------------------
-- Drop any existing policies so we can recreate cleanly
-- ----------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can view own downloads" on public.downloads;
drop policy if exists "Anyone can insert downloads (anonymous allowed)" on public.downloads;
drop policy if exists "Users can insert own downloads" on public.downloads;
drop policy if exists "Users can delete own downloads" on public.downloads;
drop policy if exists "Users can update own downloads" on public.downloads;

-- ----------------------------------------------------------
-- PROFILES policies (owner only)
-- ----------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy → users cannot delete their profile via client
-- (account deletion is handled by auth.users cascade)

-- ----------------------------------------------------------
-- DOWNLOADS policies (owner only, authenticated only)
-- ----------------------------------------------------------
create policy "downloads_select_own"
  on public.downloads
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "downloads_insert_own"
  on public.downloads
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Optional: allow users to update their own rows (e.g. fix title)
-- Uncomment if you need it:
-- create policy "downloads_update_own"
--   on public.downloads
--   for update
--   to authenticated
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);

create policy "downloads_delete_own"
  on public.downloads
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Explicitly revoke public / anon access
revoke all on public.profiles from anon, public;
revoke all on public.downloads from anon, public;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.downloads to authenticated;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at fresh on profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
