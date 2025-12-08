-- Enable moddatetime extension
create extension if not exists moddatetime schema extensions;

-- Create Investments Table
create table if not exists investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null, -- stock, mutual_fund, gold, fd, real_estate, crypto, other
  amount_invested numeric not null default 0,
  current_value numeric not null default 0,
  quantity numeric, -- optional, for stocks/gold units
  purchase_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table investments enable row level security;

-- RLS Policies
create policy "Users can view their own investments"
  on investments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own investments"
  on investments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own investments"
  on investments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own investments"
  on investments for delete
  using (auth.uid() = user_id);

-- Trigger for Updated At
create trigger handle_updated_at before update on investments
  for each row execute procedure moddatetime (updated_at);
