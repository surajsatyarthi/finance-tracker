-- Create pay_later_services table
create table if not exists public.pay_later_services (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  service_name text not null,
  service_code text, -- e.g. AMZN-PAY-LATER
  credit_limit numeric default 0,
  used_amount numeric default 0,
  current_due numeric default 0,
  available_amount numeric generated always as (credit_limit - used_amount) stored, -- Optional, or calc in app
  next_due_date date,
  due_schedule text, -- '5th of every month'
  status text default 'active', -- 'active', 'due_soon', 'overdue', 'suspended'
  interest_rate numeric,
  penalty_fee numeric,
  last_used timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
alter table public.pay_later_services enable row level security;

create policy "Users can view their own pay later services" 
  on public.pay_later_services for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own pay later services" 
  on public.pay_later_services for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own pay later services" 
  on public.pay_later_services for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own pay later services" 
  on public.pay_later_services for delete 
  using (auth.uid() = user_id);
