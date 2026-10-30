-- =========================================================================
-- SYAFIRA STORE SCHEMA UPDATE V5: ADMIN ACCOUNTS & SEEDER
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon/authenticated roles
DROP POLICY IF EXISTS "Allow anon all on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow anon all on admin_accounts" ON public.admin_accounts
  FOR ALL USING (true) WITH CHECK (true);

-- Seed initial admin accounts (Syafira Prabandari & Darya Satya with Full Access)
INSERT INTO public.admin_accounts (email, password, name, role)
VALUES 
  ('prabandarisyafira@gmail.com', '@syafira123', 'Syafira Prabandari', 'Super Admin'),
  ('daryassatya@gmail.com', 'tititsayabesar123', 'Darya Satya', 'Super Admin')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, name = EXCLUDED.name, updated_at = now();
