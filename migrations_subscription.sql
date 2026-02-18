
-- 1. Create profiles table to extend auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  subscription_plan text not null default 'trial',
  trial_ends_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, subscription_plan, trial_ends_at)
  values (new.id, 'trial', (now() + interval '30 days'));
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger for new signups
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Backfill existing users (Optional, user asked for it)
insert into public.profiles (id, subscription_plan, trial_ends_at)
select id, 'trial', (now() + interval '30 days')
from auth.users
on conflict (id) do nothing;
