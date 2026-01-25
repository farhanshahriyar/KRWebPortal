-- Create the update_logs table
create table public.update_logs (
  id uuid not null default gen_random_uuid (),
  version text not null,
  title text not null,
  description text not null,
  date date not null default current_date,
  changes jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  created_by uuid null,
  constraint update_logs_pkey primary key (id),
  constraint update_logs_created_by_fkey foreign key (created_by) references auth.users (id)
);

-- specific policy for update_logs
alter table public.update_logs enable row level security;

-- Policy: Everyone can view details
create policy "Everyone can view update logs" on public.update_logs
  for select
  using (true);

-- Policy: Only Admins can insert/update/delete
-- Assuming 'kr_admin' is a role in the profiles table.

create policy "Admins can insert update logs" on public.update_logs
  for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'kr_admin'
    )
  );

create policy "Admins can update update logs" on public.update_logs
  for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'kr_admin'
    )
  );

create policy "Admins can delete update logs" on public.update_logs
  for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'kr_admin'
    )
  );
