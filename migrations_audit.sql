-- Create audit_logs table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid(),
  action text not null, -- INSERT, UPDATE, DELETE
  table_name text not null, -- e.g. 'shifts'
  details text -- e.g. record ID or JSON summary
);

-- Enable RLS
alter table audit_logs enable row level security;

-- Policies
create policy "Users can view their own audit logs"
on audit_logs for select
using ( auth.uid() = user_id );

create policy "Users can insert their own audit logs"
on audit_logs for insert
with check ( auth.uid() = user_id );

-- Optional: Trigger to auto-log changes in 'shifts' could be added here, 
-- but for MVP we might just log manually in the application code as requested.
