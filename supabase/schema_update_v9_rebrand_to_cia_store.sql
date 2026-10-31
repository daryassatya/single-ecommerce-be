-- ==============================================================================
-- CIA STORE - DATABASE REBRANDING & SYNC MIGRATION (V9)
-- Skrip SQL lengkap untuk memastikan semua data di database Supabase
-- telah berubah dari "Syafira Store" / "Syafira" menjadi "Cia Store" / "Cia"
-- ==============================================================================

-- 1. Update Profil Toko & Pesan Berjalan (store_profile)
UPDATE public.store_profile
SET 
  store_name = 'Cia Store ✦˚𝜗𝜚.ᐟ',
  handle = '@ciastore',
  announcement_text = 'Promo Cia Store: Diskon Rp 2.000 untuk pembelian bundel Netflix + Canva Pro hari ini!',
  marquee_messages = ARRAY[
    'check product details before ordering ✦',
    'made with love & pixel magic by Cia Store ✦',
    'thank you for shopping small & supporting Cia ✦',
    'fast response 5–30 minutes process ✦',
    'legal, safe & guaranteed warranty ✦'
  ]::TEXT[],
  updated_at = now()
WHERE id = '33333333-3333-3333-3333-333333333333'
   OR store_name ILIKE '%syafira%';

-- 2. Update Banner Hero Carousel (hero_slides)
UPDATE public.hero_slides
SET 
  badge = REPLACE(badge, 'SYAFIRA', 'CIA'),
  title = REPLACE(title, 'Syafira', 'Cia'),
  description = REPLACE(REPLACE(description, 'Syafira Store', 'Cia Store'), 'Admin Syafira', 'Admin Cia')
WHERE badge ILIKE '%syafira%' 
   OR title ILIKE '%syafira%' 
   OR description ILIKE '%syafira%';

-- 3. Update Ulasan & Testimoni Pelanggan (testimonials)
UPDATE public.testimonials
SET 
  text = REPLACE(REPLACE(text, 'Syafira Store', 'Cia Store'), 'Syafira', 'Cia')
WHERE text ILIKE '%syafira%';

-- 4. Update Syarat & Ketentuan Transaksi (terms_and_conditions)
UPDATE public.terms_and_conditions
SET 
  content = REPLACE(REPLACE(content, 'Syafira Store', 'Cia Store'), 'Admin Syafira', 'Admin Cia')
WHERE content ILIKE '%syafira%';

-- 5. Update Akun Admin Dashboard (admin_accounts)
UPDATE public.admin_accounts
SET 
  name = 'Cia',
  updated_at = now()
WHERE name ILIKE '%syafira%';

-- Opsional: Daftarkan akun admin baru (admin@ciastore.com) jika ingin digunakan
INSERT INTO public.admin_accounts (email, password, name, role)
VALUES 
  ('admin@ciastore.com', '@cia123', 'Cia', 'Super Admin')
ON CONFLICT (email) DO UPDATE
SET name = 'Cia', updated_at = now();
