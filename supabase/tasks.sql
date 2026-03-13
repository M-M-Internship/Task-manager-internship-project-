create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  deadline date,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'incomplete' check (status in ('incomplete', 'active', 'done')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.tasks
alter column user_id set default auth.uid();

create index if not exists tasks_user_id_created_at_idx
on public.tasks (user_id, created_at desc);

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_tasks_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "Allow anonymous read access to tasks" on public.tasks;
drop policy if exists "Allow anonymous insert access to tasks" on public.tasks;
drop policy if exists "Allow anonymous update access to tasks" on public.tasks;
drop policy if exists "Allow anonymous delete access to tasks" on public.tasks;
drop policy if exists "Authenticated users can view their own tasks" on public.tasks;
create policy "Authenticated users can view their own tasks"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create their own tasks" on public.tasks;
create policy "Authenticated users can create their own tasks"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can update their own tasks" on public.tasks;
create policy "Authenticated users can update their own tasks"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete their own tasks" on public.tasks;
create policy "Authenticated users can delete their own tasks"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  schedule_date date not null,
  title text not null check (char_length(trim(title)) > 0),
  notes text,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (end_time > start_time)
);

alter table public.schedules
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.schedules
alter column user_id set default auth.uid();

create index if not exists schedules_user_id_schedule_date_start_time_idx
on public.schedules (user_id, schedule_date, start_time);

create or replace function public.set_schedules_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_schedules_updated_at on public.schedules;

create trigger set_schedules_updated_at
before update on public.schedules
for each row
execute function public.set_schedules_updated_at();

alter table public.schedules enable row level security;

drop policy if exists "Authenticated users can view their own schedules" on public.schedules;
create policy "Authenticated users can view their own schedules"
on public.schedules
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create their own schedules" on public.schedules;
create policy "Authenticated users can create their own schedules"
on public.schedules
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can update their own schedules" on public.schedules;
create policy "Authenticated users can update their own schedules"
on public.schedules
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete their own schedules" on public.schedules;
create policy "Authenticated users can delete their own schedules"
on public.schedules
for delete
to authenticated
using (auth.uid() = user_id);
