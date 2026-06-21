-- ============================================================================
-- FITNESS TRACKER — DATABASE SCHEMA
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- user_profile
-- One row per authenticated user, created during onboarding.
-- ----------------------------------------------------------------------------
create table if not exists public.user_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  age int not null check (age > 0 and age < 120),
  gender text not null default 'prefer_not_to_say',
  height numeric not null check (height > 0),       -- cm
  weight numeric not null check (weight > 0),        -- kg, current weight
  goal_weight numeric not null check (goal_weight > 0),
  fitness_goal text not null default 'fitness',      -- gain_muscle | lose_fat | fitness
  experience_level text not null default 'beginner', -- beginner | intermediate | advanced
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- ----------------------------------------------------------------------------
-- workouts
-- Shared catalog of exercises across the 2-week program.
-- `day` uses a 'week1-day1' style key so the plan can be grouped by week.
-- ----------------------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  title text not null,
  description text,
  image_url text,
  video_url text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists workouts_day_order_idx on public.workouts (day, order_index);

-- ----------------------------------------------------------------------------
-- user_workout_progress
-- Tracks per-user completion of each workout/exercise.
-- ----------------------------------------------------------------------------
create table if not exists public.user_workout_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, workout_id)
);

create index if not exists progress_user_idx on public.user_workout_progress (user_id);

-- ----------------------------------------------------------------------------
-- weight_logs
-- ----------------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric not null check (weight > 0),
  created_at timestamptz not null default now()
);

create index if not exists weight_logs_user_idx on public.weight_logs (user_id, created_at);

-- ----------------------------------------------------------------------------
-- meals
-- ----------------------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal text not null,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_idx on public.meals (user_id, created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.user_profile enable row level security;
alter table public.workouts enable row level security;
alter table public.user_workout_progress enable row level security;
alter table public.weight_logs enable row level security;
alter table public.meals enable row level security;

-- user_profile: users can only see/edit their own row
create policy "select own profile"
  on public.user_profile for select
  using (auth.uid() = user_id);

create policy "insert own profile"
  on public.user_profile for insert
  with check (auth.uid() = user_id);

create policy "update own profile"
  on public.user_profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own profile"
  on public.user_profile for delete
  using (auth.uid() = user_id);

-- workouts: public read-only (no insert/update/delete policies for regular users)
create policy "anyone can read workouts"
  on public.workouts for select
  using (true);

-- user_workout_progress: users can only access their own rows
create policy "select own progress"
  on public.user_workout_progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.user_workout_progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.user_workout_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own progress"
  on public.user_workout_progress for delete
  using (auth.uid() = user_id);

-- weight_logs: users can only access their own rows
create policy "select own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "insert own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "update own weight logs"
  on public.weight_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own weight logs"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

-- meals: users can only access their own rows
create policy "select own meals"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "insert own meals"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "update own meals"
  on public.meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own meals"
  on public.meals for delete
  using (auth.uid() = user_id);
