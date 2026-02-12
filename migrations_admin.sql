-- Create drivers table
create table if not exists drivers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  boss_id uuid references auth.users default auth.uid(),
  name text not null
);

-- Enable RLS for drivers
alter table drivers enable row level security;

create policy "Users can view own drivers"
on drivers for select
using ( auth.uid() = boss_id );

create policy "Users can insert own drivers"
on drivers for insert
with check ( auth.uid() = boss_id );

create policy "Users can delete own drivers"
on drivers for delete
using ( auth.uid() = boss_id );


-- Update shifts table
alter table shifts 
add column if not exists driver_id uuid references drivers(id);

-- Update shifts policies to allow viewing if you own the linked driver
-- This is tricky with simple RLS. Easier: if you own the shift (user_id = auth.uid), you see it.
-- When creating a shift for a driver, we'll set user_id = current_user (Boss) and driver_id = selected_driver.
-- So existing policies on shifts (auth.uid() = user_id) should still work for the Boss.
