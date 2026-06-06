-- Habilitar UUID
create extension if not exists "uuid-ossp";

-- PERFIL DO USUÁRIO
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  monthly_income numeric(12,2) not null default 0,
  spending_limit numeric(12,2) not null default 0,
  onboarded boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TRANSAÇÕES
create table if not exists transactions (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null,
  description text not null default '',
  category text not null default 'Outro',
  date date not null,
  created_at timestamptz default now()
);

-- METAS
create table if not exists goals (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  total numeric(12,2) not null,
  saved numeric(12,2) not null default 0,
  is_emergency boolean not null default false,
  created_at timestamptz default now()
);

-- CONTAS FIXAS
create table if not exists fixed_bills (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null,
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  paid boolean not null default false,
  created_at timestamptz default now()
);

-- PLANEJAMENTOS
create table if not exists planning (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade not null,
  month text not null,
  incomes jsonb not null default '[]',
  expenses jsonb not null default '[]',
  created_at timestamptz default now(),
  unique(user_id, month)
);

-- ROW LEVEL SECURITY — cada usuário vê só os próprios dados
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table fixed_bills enable row level security;
alter table planning enable row level security;

-- Policies profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies transactions
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Policies goals
create policy "Users can view own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on goals for delete using (auth.uid() = user_id);

-- Policies fixed_bills
create policy "Users can view own bills" on fixed_bills for select using (auth.uid() = user_id);
create policy "Users can insert own bills" on fixed_bills for insert with check (auth.uid() = user_id);
create policy "Users can update own bills" on fixed_bills for update using (auth.uid() = user_id);
create policy "Users can delete own bills" on fixed_bills for delete using (auth.uid() = user_id);

-- Policies planning
create policy "Users can view own planning" on planning for select using (auth.uid() = user_id);
create policy "Users can insert own planning" on planning for insert with check (auth.uid() = user_id);
create policy "Users can update own planning" on planning for update using (auth.uid() = user_id);
create policy "Users can delete own planning" on planning for delete using (auth.uid() = user_id);

-- Trigger para updated_at no profile
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
for each row execute function update_updated_at();

-- Trigger para criar perfil automaticamente ao criar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
