-- Add user_id column
alter table time_entries 
add column if not exists user_id uuid references auth.users default auth.uid();

-- Force RLS
alter table time_entries enable row level security;

-- Remove old permissive policies (if they exist)
drop policy if exists "Enable read access for all users" on time_entries;
drop policy if exists "Enable insert for all users" on time_entries;

-- Create strict policies

-- 1. Users can only see their own entries
create policy "Users can view own entries"
on time_entries for select
using ( auth.uid() = user_id );

-- 2. Users can only insert their own entries
create policy "Users can insert own entries"
on time_entries for insert
with check ( auth.uid() = user_id );

-- 3. Users can only delete their own entries
create policy "Users can delete own entries"
on time_entries for delete
using ( auth.uid() = user_id );
