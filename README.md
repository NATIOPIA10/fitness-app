# Fitness Tracker

A mobile-first fitness tracking web app built with React (Vite), Tailwind CSS, and Supabase.

## Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (mobile-first)
- **Backend**: Supabase (Auth, Postgres, Row Level Security)
- **Charts**: Recharts
- **Icons**: lucide-react

## Features

- Email/password auth with onboarding flow for new users
- Daily workout sessions with **sequential unlock** — the next exercise only opens once the previous one is marked done
- Full 2-week workout plan, view-only, grouped by week
- Weight tracking with goal progress bar and line chart
- Meal/nutrition logging
- Workout history with streak tracking
- Editable profile

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to supabase.com, create a new project, and grab your **Project URL** and **anon public key** from Settings -> API.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up the database

In the Supabase SQL editor, run the two files in this order:

1. `supabase/schema.sql` — creates all tables, indexes, and Row Level Security policies
2. `supabase/seed.sql` — seeds the 2-week workout program (push-ups, squats, plank, etc.)

### 5. (Optional) Configure auth

By default Supabase requires email confirmation for new sign-ups. You can turn this off for local testing in **Authentication -> Providers -> Email -> Confirm email**, or leave it on for production.

### 6. Run the app

```bash
npm run dev
```

Open the printed local URL. The app is mobile-first — use your browser's device toolbar (iPhone/Android viewport) for the intended experience, or open it on your phone.

## Project structure

```
src/
  components/   Shared UI: BottomNav, Button, Field, Screen, StepRing, RouteGuards
  context/      AuthContext — session + profile state
  lib/          Supabase client
  pages/        One file per route (Login, Register, Onboarding, Dashboard, ...)
supabase/
  schema.sql    Tables + RLS policies
  seed.sql      2-week workout program seed data
```

## Routing & auth flow

- `/login`, `/register` — public, redirect to `/dashboard` or `/onboarding` if already signed in
- `/onboarding` — shown only when a session exists but no `user_profile` row yet
- `/dashboard`, `/today-workout`, `/workout-plan`, `/progress`, `/nutrition`, `/history`, `/profile` — require both a session and a completed profile

## Database schema

| Table | Purpose | RLS |
|---|---|---|
| `user_profile` | One row per user, set during onboarding | Owner-only |
| `workouts` | Shared 2-week exercise catalog | Public read |
| `user_workout_progress` | Per-user completion of each exercise | Owner-only |
| `weight_logs` | Weight history | Owner-only |
| `meals` | Meal/nutrition log | Owner-only |

## Notes on the sequential-unlock logic

`workouts.day` uses keys like `week1-day1`, ordered within a day by `order_index`. The app finds the first day with an incomplete exercise and treats that as "today." Within that day, only the first not-yet-completed workout is unlockable — completing it unlocks the next one in `order_index` order.
