-- Adicionar coluna locale no profiles (caso não exista)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale text DEFAULT 'pt';

-- Adicionar coluna achievements para medalhas futuras
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]';

-- Garantir que o trigger de criação automática de perfil existe
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, monthly_income, spending_limit, onboarded, locale)
  VALUES (new.id, '', 0, 0, false, 'pt')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
