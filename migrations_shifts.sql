-- Create shifts table
create table if not exists shifts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid(),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  break_minutes integer default 0,
  duration_hours numeric generated always as (
    (extract(epoch from (end_time - start_time)) / 3600.0) - (break_minutes / 60.0)
  ) stored
);

-- Enable RLS
alter table shifts enable row level security;

-- Policies
create policy "Users can view own shifts"
on shifts for select
using ( auth.uid() = user_id );

create policy "Users can insert own shifts"
on shifts for insert
with check ( auth.uid() = user_id );

create policy "Users can delete own shifts"
on shifts for delete
using ( auth.uid() = user_id );
