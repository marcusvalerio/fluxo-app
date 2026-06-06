-- ─── FLUXO — Setup completo do banco ───────────────────────────────

-- Tabela de perfis (complementa o auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  monthly_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  spending_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12,2) NOT NULL,
  desc TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Outro',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS public.goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  saved NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de contas fixas
CREATE TABLE IF NOT EXISTS public.fixed_bills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de planejamentos mensais
CREATE TABLE IF NOT EXISTS public.planning (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  incomes JSONB NOT NULL DEFAULT '[]',
  expenses JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuário vê e modifica apenas os próprios dados
CREATE POLICY "profiles: own data" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "transactions: own data" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "goals: own data" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "fixed_bills: own data" ON public.fixed_bills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "planning: own data" ON public.planning
  FOR ALL USING (auth.uid() = user_id);

-- ─── TRIGGER: cria perfil automaticamente ao cadastrar ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ÍNDICES para performance ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS fixed_bills_user ON public.fixed_bills(user_id);
CREATE INDEX IF NOT EXISTS planning_user_month ON public.planning(user_id, month);
