-- Create Feedback Table
create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  message text,
  user_agent text,
  /* 
     Storing images as base64 text array for simplicity in this MVP 
     to avoid configuring Storage Buckets immediately.
     Limit strictly enforced in API.
  */
  images text[], 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table feedback enable row level security;

-- Policy: Allow ANYONE (including anon) to insert feedback
-- This is critical for the mobile feedback form to work easily
create policy "Enable insert for everyone" on feedback
  for insert with check (true);

-- Policy: Allow only authenticated users to read (admins)
-- Assuming 'authenticated' role for now, or just limit to service role if we had an admin dashboard
create policy "Enable read for authenticated users only" on feedback
  for select using (auth.role() = 'authenticated');
