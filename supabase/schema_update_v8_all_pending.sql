-- ==============================================================================
-- CIA STORE - COMPREHENSIVE SCHEMA UPDATE (V8 ALL-IN-ONE)
-- Project: qbwqixbfkwdmfcungqom (Cia Store Supabase DB)
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qbwqixbfkwdmfcungqom/sql/new
-- ==============================================================================

-- 1. TABEL: admin_accounts (Sistem Akun Admin Dashboard)
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Izinkan anon & authenticated membaca dan mengelola akun admin
DROP POLICY IF EXISTS "Allow anon all on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow anon all on admin_accounts" ON public.admin_accounts
  FOR ALL USING (true) WITH CHECK (true);

-- Index Email
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts (email);

-- Seed Data Akun Admin Default
INSERT INTO public.admin_accounts (email, password, name, role)
VALUES 
  ('prabandarisyafira@gmail.com', '@syafira123', 'Syafira Prabandari', 'Super Admin'),
  ('daryassatya@gmail.com', 'tititsayabesar123', 'Darya Satya', 'Super Admin')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, 
    name = EXCLUDED.name, 
    role = EXCLUDED.role,
    updated_at = now();

-- ------------------------------------------------------------------------------
-- 2. UPDATE TABEL: store_profile (Menambahkan kolom Foto Profil Toko / Avatar)
-- ------------------------------------------------------------------------------
ALTER TABLE public.store_profile 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- ------------------------------------------------------------------------------
-- 3. OPTIMASI INDEX DATABASE (Performa Query & Foreign Key)
-- ------------------------------------------------------------------------------
-- Index Produk & Kategori
CREATE INDEX IF NOT EXISTS idx_products_type_id ON public.products (type_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- Index Varian Produk
CREATE INDEX IF NOT EXISTS idx_pvt_product_id ON public.product_variant_types (product_id);
CREATE INDEX IF NOT EXISTS idx_pvo_variant_type_id ON public.product_variant_options (variant_type_id);
CREATE INDEX IF NOT EXISTS idx_pvo_is_available ON public.product_variant_options (is_available);

-- Index Tautan Sosial Media
CREATE INDEX IF NOT EXISTS idx_social_links_is_active ON public.social_media_links (is_active);
CREATE INDEX IF NOT EXISTS idx_social_links_sort_order ON public.social_media_links (sort_order ASC);

-- Index Testimoni
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON public.testimonials (is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials (created_at DESC);

-- Index Hero Carousel
CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON public.hero_slides (is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON public.hero_slides (sort_order ASC);

-- Index Syarat & Ketentuan (T&C)
CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms_and_conditions (category);
CREATE INDEX IF NOT EXISTS idx_terms_is_active ON public.terms_and_conditions (is_active);
