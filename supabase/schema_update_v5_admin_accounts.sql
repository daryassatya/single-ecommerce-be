-- =========================================================================
-- SYAFIRA STORE SCHEMA UPDATE V5: ADMIN ACCOUNTS TABLE
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

-- Allow full access for anon/authenticated roles for admin operations
DROP POLICY IF EXISTS "Allow anon all on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow anon all on admin_accounts" ON public.admin_accounts
  FOR ALL USING (true) WITH CHECK (true);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts (email);
