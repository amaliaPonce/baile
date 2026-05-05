create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  slug text unique not null,
  bio text,
  avatar_url text,
  session_duration_minutes int default 60,
  created_at timestamptz default now()
);

create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid references profiles(id) on delete cascade not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid references profiles(id) on delete cascade not null,
  student_name text not null,
  student_email text not null,
  student_phone text,
  student_dance_style text,
  student_level text,
  notes text,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz default now()
);

alter table bookings add column if not exists student_phone text;
alter table bookings add column if not exists student_dance_style text;
alter table bookings add column if not exists student_level text;

alter table profiles enable row level security;
alter table availability_slots enable row level security;
alter table bookings enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_public_by_slug" on profiles;
create policy "profiles_public_by_slug"
  on profiles for select
  to anon, authenticated
  using (slug is not null);

drop policy if exists "availability_professor_all" on availability_slots;
create policy "availability_professor_all"
  on availability_slots for all
  to authenticated
  using (auth.uid() = professor_id)
  with check (auth.uid() = professor_id);

drop policy if exists "availability_public_read_active" on availability_slots;
create policy "availability_public_read_active"
  on availability_slots for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "bookings_professor_select" on bookings;
create policy "bookings_professor_select"
  on bookings for select
  to authenticated
  using (auth.uid() = professor_id);

drop policy if exists "bookings_professor_update" on bookings;
create policy "bookings_professor_update"
  on bookings for update
  to authenticated
  using (auth.uid() = professor_id)
  with check (auth.uid() = professor_id);

drop policy if exists "bookings_public_insert" on bookings;
create policy "bookings_public_insert"
  on bookings for insert
  to anon, authenticated
  with check (true);

create index if not exists availability_slots_professor_day_idx
  on availability_slots (professor_id, day_of_week);

create index if not exists bookings_professor_date_idx
  on bookings (professor_id, date, start_time);

create unique index if not exists bookings_unique_confirmed_slot_idx
  on bookings (professor_id, date, start_time, end_time)
  where status = 'confirmed';
