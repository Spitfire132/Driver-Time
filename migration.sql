create table if not exists time_entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  driver_name text not null,
  work_date date not null,
  target_hours numeric not null,
  actual_hours numeric not null
);

-- Optional: Enable RLS and policies if needed later, but keeping it simple for now as per "simple MVP" request.
-- For a real app, we'd want RLS.
alter table time_entries enable row level security;

create policy "Enable read access for all users"
on "public"."time_entries"
as PERMISSIVE
for SELECT
to public
using (
  true
);

create policy "Enable insert for all users"
on "public"."time_entries"
as PERMISSIVE
for INSERT
to public
with check (
  true
);
