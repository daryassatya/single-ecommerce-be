-- ==============================================================================
-- CONTOH NAMA TOKO (SINGLE E-COMMERCE DISPLAY)
-- MASTER SUPABASE DATABASE SCHEMA & COMPREHENSIVE DUMMY DATA SEEDER
-- ==============================================================================
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- Supabase Dashboard -> Project -> SQL Editor -> New Query -> Paste & Run
-- Skrip ini idempotent (aman dijalankan berulang kali).
-- ==============================================================================

-- 0. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABEL: admin_accounts (Autentikasi Admin Dashboard)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. TABEL: product_types (Kategori / Tipe Produk)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. TABEL: products (Katalog Produk E-Commerce berbasis Lucide Icons)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID REFERENCES public.product_types(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    base_price NUMERIC(12, 2) DEFAULT NULL,
    has_variants BOOLEAN NOT NULL DEFAULT FALSE,
    badge VARCHAR(100),
    icon_name VARCHAR(100) NOT NULL DEFAULT 'Package',
    variants TEXT[] DEFAULT '{}'::TEXT[],
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. TABEL: product_variant_types (Varian Tingkat 1 - Parent)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variant_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. TABEL: product_variant_options (Opsi Varian Tingkat 2 - Child & Harga)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variant_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_type_id UUID NOT NULL REFERENCES public.product_variant_types(id) ON DELETE CASCADE,
    label VARCHAR(150) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. TABEL: customer_message_settings (Template Pesan WhatsApp Otomatis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_message_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL DEFAULT 'default_order_message',
    title VARCHAR(150) NOT NULL DEFAULT 'Template Pesan Order WhatsApp',
    description TEXT DEFAULT 'Template pesan yang otomatis dibuat ketika customer memilih produk untuk checkout via WhatsApp.',
    message_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. TABEL: social_media_links (Tautan Media Sosial & Navigasi Eksternal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_media_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT '',
    url TEXT NOT NULL,
    icon_name VARCHAR(100) NOT NULL DEFAULT 'Share2',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_external BOOLEAN NOT NULL DEFAULT TRUE,
    tab_target VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. TABEL: testimonials (Ulasan & Bukti Pembayaran Pelanggan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    product VARCHAR(150) NOT NULL,
    text TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. TABEL: hero_slides (Banner Slider Sambutan Top Display)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. TABEL: terms_and_conditions (Syarat & Ketentuan Layanan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.terms_and_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. TABEL: store_profile (Pengaturan Bio Toko, Jam Buka, Stats & Ticker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(150) NOT NULL DEFAULT 'Contoh Nama Toko',
    handle VARCHAR(100) NOT NULL DEFAULT '@oepalin',
    badge_text VARCHAR(100) NOT NULL DEFAULT 'DIGITAL GOODIES & SOCIAL HUB',
    bio TEXT NOT NULL DEFAULT 'Tempat paling nyaman buat langganan aplikasi premium & digital goodies dengan garansi penuh dan proses kilat 5–30 menit.',
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '6281400688284',
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    stat_goodies VARCHAR(50) NOT NULL DEFAULT '56',
    stat_folls VARCHAR(50) NOT NULL DEFAULT '3.2k',
    stat_folks VARCHAR(50) NOT NULL DEFAULT '4.1k',
    announcement_text TEXT NOT NULL DEFAULT 'Katalog Baru! Beragam Aplikasi Premium siap diorder via WhatsApp Order ✨',
    marquee_messages TEXT[] NOT NULL DEFAULT ARRAY[
        'check product details before ordering 🛍️',
        'made with love & pixel magic by Contoh Nama Toko 💜',
        'QRIS All E-Wallet & All Bank Ready 💳',
        'WhatsApp Order: https://wa.me/6281400688284 ✨'
    ]::TEXT[],
    avatar_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 12. TRIGGERS: Auto Update updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_accounts_updated_at ON public.admin_accounts;
CREATE TRIGGER trg_admin_accounts_updated_at
    BEFORE UPDATE ON public.admin_accounts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_product_types_updated_at ON public.product_types;
CREATE TRIGGER trg_product_types_updated_at
    BEFORE UPDATE ON public.product_types
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_customer_message_settings_updated_at ON public.customer_message_settings;
CREATE TRIGGER trg_customer_message_settings_updated_at
    BEFORE UPDATE ON public.customer_message_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_store_profile_updated_at ON public.store_profile;
CREATE TRIGGER trg_store_profile_updated_at
    BEFORE UPDATE ON public.store_profile
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 13. INDEXES: Optimasi Query, Foreign Keys & Filter
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts(email);

CREATE INDEX IF NOT EXISTS idx_product_types_slug ON public.product_types(slug);
CREATE INDEX IF NOT EXISTS idx_product_types_is_active ON public.product_types(is_active);

CREATE INDEX IF NOT EXISTS idx_products_type_id ON public.products(type_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_variant_types_product_id ON public.product_variant_types(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_options_type_id ON public.product_variant_options(variant_type_id);
CREATE INDEX IF NOT EXISTS idx_variant_options_is_available ON public.product_variant_options(is_available);

CREATE INDEX IF NOT EXISTS idx_social_links_is_active ON public.social_media_links(is_active);
CREATE INDEX IF NOT EXISTS idx_social_links_sort ON public.social_media_links(sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON public.hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort ON public.hero_slides(sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms_and_conditions(category);
CREATE INDEX IF NOT EXISTS idx_terms_is_active ON public.terms_and_conditions(is_active);

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) & POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow all on admin_accounts" ON public.admin_accounts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view product types" ON public.product_types;
CREATE POLICY "Public can view product types" ON public.product_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on product_types" ON public.product_types;
CREATE POLICY "Allow all on product_types" ON public.product_types FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on products" ON public.products;
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.product_variant_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view variant types" ON public.product_variant_types;
CREATE POLICY "Public can view variant types" ON public.product_variant_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on variant types" ON public.product_variant_types;
CREATE POLICY "Allow all on variant types" ON public.product_variant_types FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.product_variant_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view variant options" ON public.product_variant_options;
CREATE POLICY "Public can view variant options" ON public.product_variant_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on variant options" ON public.product_variant_options;
CREATE POLICY "Allow all on variant options" ON public.product_variant_options FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.customer_message_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view customer message settings" ON public.customer_message_settings;
CREATE POLICY "Public can view customer message settings" ON public.customer_message_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on customer_message_settings" ON public.customer_message_settings;
CREATE POLICY "Allow all on customer_message_settings" ON public.customer_message_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view social links" ON public.social_media_links;
CREATE POLICY "Public can view social links" ON public.social_media_links FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on social_media_links" ON public.social_media_links;
CREATE POLICY "Allow all on social_media_links" ON public.social_media_links FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
CREATE POLICY "Public can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all on testimonials" ON public.testimonials;
CREATE POLICY "Allow all on testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active hero slides" ON public.hero_slides;
CREATE POLICY "Public can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Allow all on hero_slides" ON public.hero_slides;
CREATE POLICY "Allow all on hero_slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active terms" ON public.terms_and_conditions;
CREATE POLICY "Public can view active terms" ON public.terms_and_conditions FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Allow all on terms_and_conditions" ON public.terms_and_conditions;
CREATE POLICY "Allow all on terms_and_conditions" ON public.terms_and_conditions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.store_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view store profile" ON public.store_profile;
CREATE POLICY "Public can view store profile" ON public.store_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all on store_profile" ON public.store_profile;
CREATE POLICY "Allow all on store_profile" ON public.store_profile FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 15. STORAGE BUCKETS SETUP & STORAGE POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('store-assets', 'store-assets', true),
  ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public view store-assets" ON storage.objects;
CREATE POLICY "Public view store-assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "Public upload store-assets" ON storage.objects;
CREATE POLICY "Public upload store-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "Public update store-assets" ON storage.objects;
CREATE POLICY "Public update store-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "Public delete store-assets" ON storage.objects;
CREATE POLICY "Public delete store-assets" ON storage.objects FOR DELETE USING (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "Public view hero-slides" ON storage.objects;
CREATE POLICY "Public view hero-slides" ON storage.objects FOR SELECT USING (bucket_id = 'hero-slides');

DROP POLICY IF EXISTS "Public upload hero-slides" ON storage.objects;
CREATE POLICY "Public upload hero-slides" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-slides');

DROP POLICY IF EXISTS "Public update hero-slides" ON storage.objects;
CREATE POLICY "Public update hero-slides" ON storage.objects FOR UPDATE USING (bucket_id = 'hero-slides');

DROP POLICY IF EXISTS "Public delete hero-slides" ON storage.objects;
CREATE POLICY "Public delete hero-slides" ON storage.objects FOR DELETE USING (bucket_id = 'hero-slides');

-- ------------------------------------------------------------------------------
-- 16. DATA SEEDING (DUMMY DATA LENGKAP)
-- ------------------------------------------------------------------------------

-- [A] Admin Accounts
INSERT INTO public.admin_accounts (email, password, name, role)
VALUES 
  ('admin@daryas.tech', '@demo123', 'Admin Demo', 'Super Admin'),
  ('daryassatya@gmail.com', 'tititsayabesar123', 'Darya Satya', 'Super Admin')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, 
    name = EXCLUDED.name, 
    role = EXCLUDED.role,
    updated_at = now();

-- [B] Store Profile
INSERT INTO public.store_profile (
    id, store_name, handle, badge_text, bio, whatsapp_number, is_open, 
    stat_goodies, stat_folls, stat_folks, announcement_text, marquee_messages, avatar_url
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Contoh Nama Toko',
    '@oepalin',
    'DIGITAL GOODIES & SOCIAL HUB',
    'Tempat paling nyaman buat langganan aplikasi premium & digital goodies dengan garansi penuh dan proses kilat 5–30 menit.',
    '6281400688284',
    TRUE,
    '56',
    '3.2k',
    '4.1k',
    'Katalog Baru! Beragam Aplikasi Premium siap diorder via WhatsApp Order ✨',
    ARRAY[
        'check product details before ordering 🛍️',
        'made with love & pixel magic by Contoh Nama Toko 💜',
        'QRIS All E-Wallet & All Bank Ready 💳',
        'WhatsApp Order: https://wa.me/6281400688284 ✨'
    ]::TEXT[],
    NULL
)
ON CONFLICT (id) DO UPDATE SET 
    store_name = EXCLUDED.store_name,
    handle = EXCLUDED.handle,
    badge_text = EXCLUDED.badge_text,
    bio = EXCLUDED.bio,
    whatsapp_number = EXCLUDED.whatsapp_number,
    is_open = EXCLUDED.is_open,
    stat_goodies = EXCLUDED.stat_goodies,
    stat_folls = EXCLUDED.stat_folls,
    stat_folks = EXCLUDED.stat_folks,
    announcement_text = EXCLUDED.announcement_text,
    marquee_messages = EXCLUDED.marquee_messages,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

-- [C] Customer Message Template
INSERT INTO public.customer_message_settings (setting_key, title, description, message_template)
VALUES (
    'default_order_message',
    'Template Pesan Order WhatsApp',
    'Template pesan yang otomatis dibuat ketika customer memilih produk untuk checkout via WhatsApp.',
    E'Halo Admin! ✨\nSaya ingin memesan produk berikut:\n\n🛍️ Produk: {nama_produk}\n📂 Kategori: {tipe_produk}\n💰 Harga: {harga}\n📝 Keterangan: {deskripsi}\n\nMohon bantu proses pesanan saya ya. Terima kasih! 🩵'
)
ON CONFLICT (setting_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    message_template = EXCLUDED.message_template,
    updated_at = now();

-- [D] Social Media Links
DELETE FROM public.social_media_links;
INSERT INTO public.social_media_links (platform, title, description, url, icon_name, sort_order, is_active, is_external, tab_target)
VALUES
    ('X (Twitter)', 'Profil X', 'x.com/oepalin • Akun resmi & update harian', 'https://x.com/oepalin', 'AtSign', 1, TRUE, TRUE, NULL),
    ('WhatsApp', 'WhatsApp Order', 'wa.me/6281400688284 • Order kilat & fast response', 'https://wa.me/6281400688284', 'Send', 2, TRUE, TRUE, NULL),
    ('Telegram', 'Testimoni Telegram', 't.me/spivces • Bukti transaksi & review', 'https://t.me/spivces', 'FileCheck2', 3, TRUE, TRUE, NULL),
    ('Review', 'Payment Proof', '4.100+ transaksi sukses & ulasan', '#testimonials', 'FileCheck2', 4, TRUE, FALSE, 'testimonials');

-- [E] Hero Slides
DELETE FROM public.hero_slides;
INSERT INTO public.hero_slides (badge, title, description, sort_order, is_active, image_url)
VALUES
    ('CONTOH NAMA TOKO', 'Welcome to Contoh Nama Toko! ✦˚𝜗𝜚.ᐟ', 'Tempat paling nyaman buat top up game & langganan aplikasi premium dengan warna baru yang segar.', 1, TRUE, NULL),
    ('FAST PROCESS 5-30 MINS', 'Robux & MLBB Ready 24/7 🎮', 'Proses kilat, legal, dan bergaransi penuh langsung dipandu oleh Admin.', 2, TRUE, NULL),
    ('PREMIUM APPS BUNDLE', 'Netflix, Canva & ChatGPT Plus ✨', 'Mulai dari Rp 3.000 saja untuk menunjang produktivitas dan hiburan harianmu.', 3, TRUE, NULL);

-- [F] Testimonials
DELETE FROM public.testimonials;
INSERT INTO public.testimonials (name, product, text, is_approved)
VALUES
    ('zee', 'Robux Roblox', 'sangat amat fast respon di Contoh Nama Toko, ada masalah langsung diselesain saat itu juga lop deh 🫶', TRUE),
    ('shenziyy', 'Canva Pro', 'adminnya ramahh, proses cepet, fast respon jugaa terus murcee, bakal repurchase lagii nantii ✨', TRUE),
    ('difa', 'Netflix Premium', 'proses pengerjaan cepet dan fastrespon banget kakaknya!! sangat amat trusted tysm kaa 🤍', TRUE),
    ('cicakk', 'Mobile Legends', 'luvvv banget soalnya satset jujur rekomen banget buat beli WDP dan robux di Contoh Nama Toko 🫱🫲', TRUE);

-- [G] Terms & Conditions
DELETE FROM public.terms_and_conditions;
INSERT INTO public.terms_and_conditions (category, content, sort_order, is_active)
VALUES
    ('apps', '1. Silakan lakukan pembayaran setelah Admin mengirimkan rincian pesanan dan QRIS resmi.', 1, TRUE),
    ('apps', '2. Wajib mengirimkan bukti pembayaran berupa tangkapan layar (screenshot) kepada Admin.', 2, TRUE),
    ('apps', '3. Proses pengerjaan berlangsung sekitar 5–30 menit jika tidak ada antrean panjang.', 3, TRUE),
    ('apps', '4. Garansi penuh berlaku sesuai durasi paket yang dipilih selama mematuhi aturan pemakaian.', 4, TRUE),
    ('apps', '5. Garansi hangus apabila pembeli mengubah sandi akun sharing atau melanggar ketentuan login.', 5, TRUE),
    ('apps', '6. Setelah detail akun dikirimkan, mohon simpan dan pahami panduannya dengan baik.', 6, TRUE),
    ('apps', '7. Kesalahan input dari pihak pembeli tidak dapat diajukan pengembalian dana (non-refundable).', 7, TRUE),
    ('robux', '1. Pastikan username Roblox dan pengaturan Gamepass sudah sesuai panduan Admin.', 1, TRUE),
    ('robux', '2. Robux via Gamepass/Send membutuhkan waktu pending 5 hari sesuai sistem resmi Roblox.', 2, TRUE),
    ('robux', '3. Bukti pengiriman Robux akan langsung dikirimkan berupa screenshot oleh Admin.', 3, TRUE),
    ('mlbb', '1. Cukup kirimkan User ID dan Zone ID Mobile Legends Anda (tanpa perlu login akun).', 1, TRUE),
    ('mlbb', '2. Proses top-up Diamond dan Weekly Diamond Pass masuk dalam 1–10 menit setelah pembayaran terkonfirmasi.', 2, TRUE),
    ('mlbb', '3. Pastikan penulisan User ID + Server sudah benar sebelum konfirmasi.', 3, TRUE);

-- [H] 3 Kategori Utama Produk
INSERT INTO public.product_types (id, name, slug, description, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Editing Apps', 'editing-apps', 'Aplikasi video & photo editing pro tanpa watermark', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Streaming Apps', 'streaming-apps', 'Aplikasi streaming film, series, anime & musik premium', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Education & Utility Apps', 'education-apps', 'Aplikasi belajar bahasa, edukasi & produktivitas resmi', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    is_active = TRUE;

-- [I] Bersihkan Produk Lama Sebelum Seeding Ulang
DELETE FROM public.products;

-- [J] 56 Produk Lengkap dengan Parent-Child Nested Variants
DO $$
DECLARE
    v_prod_id UUID;
    v_type_id UUID;
BEGIN

    -- [1/56] Produk: CapCut Pro (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'CapCut Pro', 8000, NULL, TRUE, 'Editing · 3 Tipe', 'clapperboard', ARRAY['Sharing 3U', 'Sharing 2U', 'Private']::TEXT[], 'Aplikasi video editor pro tanpa watermark dengan fitur AI & cloud storage.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 3U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 8000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 12000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 17000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 35000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 2U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 9000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 45000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 10000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 18000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 25000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan (Tanyakan Admin)', 0, TRUE, 4);

    -- [2/56] Produk: Canva Pro (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Canva Pro', 3000, NULL, TRUE, 'Desain · 3 Tipe', 'palette', ARRAY['Member', '+Template Designer', 'Education']::TEXT[], 'Akses jutaan template premium, hapus background instan & font brand kit.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Member', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 3000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 5000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 7000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 12000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 14000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 17000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '4 Bulan', 20000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Bulan', 24000, TRUE, 8);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 27000, TRUE, 9);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun (Garansi 6 Bulan)', 32000, TRUE, 10);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun (Full Garansi)', 37000, TRUE, 11);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, '+Template Designer', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 7000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 9000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 14000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 39000, TRUE, 5);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Education', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime (Garansi 6 Bulan)', 34000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime (Garansi 12 Bulan)', 40000, TRUE, 2);

    -- [3/56] Produk: DazzCam iOS (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'DazzCam iOS', 30000, NULL, TRUE, 'Retro Camera', 'palette', ARRAY['Lifetime']::TEXT[], 'Kamera analog retro 90-an dengan preset vintage aesthetic untuk iPhone.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Lifetime', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Garansi 6 Bulan', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Garansi 1 Tahun', 45000, TRUE, 2);

    -- [4/56] Produk: CamScanner (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'CamScanner', 20000, NULL, TRUE, 'Document Scanner', 'box', ARRAY['Sharing', 'Private']::TEXT[], 'Scan dokumen HD tanpa watermark, konversi PDF, OCR teks akurat.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 35000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 1);

    -- [5/56] Produk: Alight Motion (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Alight Motion', 15000, NULL, TRUE, 'Motion Graphics', 'clapperboard', ARRAY['Sharing', 'Private']::TEXT[], 'Animasi profesional, motion design & visual effect tanpa watermark.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 30000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 50000, TRUE, 2);

    -- [6/56] Produk: Beauty Plus (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Beauty Plus', 33000, NULL, TRUE, 'Selfie & Retouch', 'sparkles', ARRAY['iOS', 'Android']::TEXT[], 'Filter selfie natural, auto beauty AI, retouch & background remover.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'iOS', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime Garansi 6 Bulan', 33000, TRUE, 1);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Android', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime Garansi 6 Bulan', 33000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime Garansi 1 Tahun', 40000, TRUE, 2);

    -- [7/56] Produk: Picsart (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Picsart', 15000, NULL, TRUE, 'Creative Studio', 'palette', ARRAY['Sharing', 'Private']::TEXT[], 'All-in-one foto editor, kolase, stiker & efek gold premium tak terbatas.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 1);

    -- [8/56] Produk: Ibis Paint (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Ibis Paint', 30000, NULL, TRUE, 'Digital Art', 'palette', ARRAY['Sharing']::TEXT[], 'Aplikasi menggambar digital favorit seniman dengan ribuan kuas & layer.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 2);

    -- [9/56] Produk: InShot (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'InShot', 40000, NULL, TRUE, 'Reels & TikTok', 'clapperboard', ARRAY['Sharing']::TEXT[], 'Editor video instan untuk konten TikTok, Instagram Reels & YouTube Shorts.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime Garansi 1 Tahun', 40000, TRUE, 1);

    -- [10/56] Produk: Adobe Lightroom (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Adobe Lightroom', 40000, NULL, TRUE, 'Color Grading', 'palette', ARRAY['Sharing']::TEXT[], 'Color grading pro, preset estetik & pengeditan RAW kelas studio.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 1);

    -- [11/56] Produk: Meitu (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Meitu', 15000, NULL, TRUE, 'Anime & AI Filter', 'sparkles', ARRAY['Sharing', 'Private']::TEXT[], 'Filter anime AI viral, pemutih kulit natural & efek kecantikan visual.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'VIP 7 Hari', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'VIP+ 7 Hari', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'VIP 1 Bulan (Tanyakan Admin)', 0, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'VIP 7 Hari', 25000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'VIP+ 7 Hari', 35000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'VIP 1 Bulan (Tanyakan Admin)', 0, TRUE, 3);

    -- [12/56] Produk: OldRoll (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'OldRoll', 35000, NULL, TRUE, 'Film Simulation', 'palette', ARRAY['Lifetime']::TEXT[], 'Simulasi kamera film klasik, warna vintage nostalgia & efek grain asli.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Lifetime', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Garansi 6 Bulan', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Garansi 1 Tahun', 45000, TRUE, 2);

    -- [13/56] Produk: Procreate (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Procreate', 35000, NULL, TRUE, 'iPad Illustration', 'palette', ARRAY['Lifetime']::TEXT[], 'Aplikasi ilustrasi dan melukis nomor 1 untuk iPad & Apple Pencil.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Lifetime', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Garansi 6 Bulan', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Garansi 1 Tahun', 40000, TRUE, 2);

    -- [14/56] Produk: Remini Web/App (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Remini Web/App', 14000, NULL, TRUE, 'AI Enhancer', 'sparkles', ARRAY['Sharing', 'Private']::TEXT[], 'Tingkatkan resolusi foto buram menjadi super jernih dengan kecerdasan AI.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 14000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 35000, TRUE, 2);

    -- [15/56] Produk: VSCO Pro (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'VSCO Pro', 25000, NULL, TRUE, 'Photo & Film', 'palette', ARRAY['Sharing Plus', 'Sharing Pro']::TEXT[], 'Preset kamera legendaris VSCO, HSL tuning & editing video estetik.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Plus', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 25000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 35000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Pro', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 45000, TRUE, 1);

    -- [16/56] Produk: Wink Video Retouch (Editing Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Wink Video Retouch', 20000, NULL, TRUE, 'Portrait Video', 'sparkles', ARRAY['Sharing', 'Private']::TEXT[], 'Retouch potret pada video, makeup halus, body tuning & 4K quality restore.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 38000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 25000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 60000, TRUE, 2);

    -- [17/56] Produk: Netflix (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Netflix', 5000, NULL, TRUE, 'UHD 4K Streaming', 'tv', ARRAY['1P2U', '1P1U', 'Special Plan', 'Private']::TEXT[], 'Nonton film & serial terbaik dunia kualitas 4K UHD tanpa batas.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, '1P2U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 8000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 25000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 55000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 85000, TRUE, 7);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, '1P1U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 6000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 12000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 18000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 30000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 45000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 85000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 125000, TRUE, 7);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Special Plan', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sempriv 1 Bulan', 55000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Anti Limit 1 Bulan', 60000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Singlescreen 1 Bulan', 65000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 4)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan RVISA', 180000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan LEGAL', 200000, TRUE, 2);

    -- [18/56] Produk: Amazon Prime Video (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Amazon Prime Video', 4000, NULL, TRUE, 'Prime Video', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Koleksi blockbuster eksklusif Amazon Originals kualitas jernih.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 4000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 8000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 12000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 4U-5U', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 3U', 20000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 2U', 25000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 35000, TRUE, 1);

    -- [19/56] Produk: YouTube Premium (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'YouTube Premium', 12000, NULL, TRUE, 'Ad-Free & Music', 'tv', ARRAY['Famplan', 'Indplan', 'Mixplan']::TEXT[], 'Bebas iklan, putar di latar belakang dan download YouTube Music.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Famplan', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 12000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 20000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Indplan', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan Renew', 45000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan No Renew', 60000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Mixplan', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 45000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '4 Bulan', 55000, TRUE, 2);

    -- [20/56] Produk: Vidio Premier (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Vidio Premier', 5000, NULL, TRUE, 'Live Sports & Series', 'tv', ARRAY['TV Only', 'Mobile', 'All Devices', 'Platinum / Ultimate Tier']::TEXT[], 'Tayangan Liga Inggris, BRI Liga 1, Champions League & Vidio Original Series.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'TV Only', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 3 Hari', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 1 Bulan', 25000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Hari', 8000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 3 Hari', 12000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 7 Hari', 20000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Bulan', 35000, TRUE, 8);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Mobile', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 1 Hari', 7000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 3 Hari', 12000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 7 Hari', 18000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 1 Bulan', 30000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Hari', 10000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 3 Hari', 15000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 7 Hari', 20000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Bulan', 40000, TRUE, 8);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'All Devices', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 1 Hari', 10000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 7 Hari', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 2U 1 Bulan', 35000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Hari', 12000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 3 Hari', 18000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 7 Hari', 25000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Bulan', 55000, TRUE, 8);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Platinum / Ultimate Tier', 4)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Platinum Extra Private 1 Bulan Mobile', 50000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Platinum Extra Private 1 Bulan AllDev', 70000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate Sharing 1 Bulan Mobile', 55000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate Sharing 1 Bulan AllDev', 87000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate Private 1 Bulan Mobile', 95000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate Private 1 Bulan AllDev', 165000, TRUE, 6);

    -- [21/56] Produk: Disney+ Hotstar (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Disney+ Hotstar', 4000, NULL, TRUE, 'Disney & Marvel', 'tv', ARRAY['Basic Plan', 'Premium Plan', 'Private']::TEXT[], 'Film Marvel, Pixar, Star Wars, Disney Princess dan serial hits Korea.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Basic Plan', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 3U', 4000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 3U', 9000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Hari 3U', 13000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 3U', 16000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 3U', 35000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 2U', 45000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Premium Plan', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 6U', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 6U', 12000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Hari 6U', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 6U', 20000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 3U', 10000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 3U', 15000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Hari 3U', 20000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 3U', 25000, TRUE, 8);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 6U', 35000, TRUE, 9);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 5U', 40000, TRUE, 10);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 4U', 46000, TRUE, 11);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 3U', 60000, TRUE, 12);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Basic', 90000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Premium', 160000, TRUE, 2);

    -- [22/56] Produk: HBO Max / Go (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'HBO Max / Go', 5000, NULL, TRUE, 'HBO Originals', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Serial blockbuster HBO, Warner Bros movies, dan tayangan eksklusif DC.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Standar 1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Standar 3 Hari', 8000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Standar 7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Standar 1 Bulan', 25000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate/Premium 1 Hari 8U', 7000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate/Premium 3 Hari 8U', 12000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate/Premium 7 Hari 8U', 20000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Ultimate/Premium 1 Bulan 8U', 35000, TRUE, 8);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Anlim 1 Hari', 8000, TRUE, 9);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Anlim 3 Hari', 18000, TRUE, 10);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Anlim 7 Hari', 25000, TRUE, 11);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Anlim 1 Bulan Sharing', 45000, TRUE, 12);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Standar', 75000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Ultimate/Premium', 125000, TRUE, 2);

    -- [23/56] Produk: Viu Premium (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Viu Premium', 2000, NULL, TRUE, 'Kdrama & Anime', 'tv', ARRAY['Private Biasa', 'Private Anlim']::TEXT[], 'Drama Korea on-going subtitle Indonesia resmi terlengkap & serial Asia.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private Biasa', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 2000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 4000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 8000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 10000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 15000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 20000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 30000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 8);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private Anlim', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 3000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 6000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 10000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 20000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 25000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 40000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 50000, TRUE, 8);

    -- [24/56] Produk: Youku VIP (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Youku VIP', 4000, NULL, TRUE, 'Cdrama Hits', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Drama Tiongkok populer & variety show romantis kualitas full HD.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 4000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 7000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 10000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 25000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 45000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 45000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 85000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 245000, TRUE, 3);

    -- [25/56] Produk: Loklok VIP (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Loklok VIP', 5000, NULL, TRUE, 'Fast Streaming', 'tv', ARRAY['Basic Sharing', 'Standard Sharing', 'Private']::TEXT[], 'Aplikasi nonton film & drama viral terlengkap tanpa batasan server.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Basic Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 3U', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 3U', 8000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Hari 3U', 11000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 3U', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 4U', 25000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 3U', 27000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Standard Sharing', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 8000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 12000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 17000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 26000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 5);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Basic 1 Hari', 7000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Basic 3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Basic 7 Hari', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Basic 11 Hari', 25000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Basic 1 Bulan', 60000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Standard 1 Bulan', 80000, TRUE, 6);

    -- [26/56] Produk: WeTV VIP (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'WeTV VIP', 5000, NULL, TRUE, 'Tencent Video', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Series lokal original Indonesia & drama romantis Asia paling viral.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 6U', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 6U', 7000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 6U', 10000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 8U', 14000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 5U-6U', 15000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan 3U / Anlim', 25000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan 5U-6U', 30000, TRUE, 7);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 1);

    -- [27/56] Produk: iQIYI VIP (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'iQIYI VIP', 4000, NULL, TRUE, 'Anime & Cdrama', 'tv', ARRAY['Sharing Standard', 'Sharing Premium', 'Private']::TEXT[], 'Streaming anime terbaru, drakor, dan serial Asia dengan audio Dolby Atmos.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Standard', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 5U', 4000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 5U', 8000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Hari 5U', 10000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Anlim', 25000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 30000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 7);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Premium', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '5 Hari', 12000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Anlim', 30000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 40000, TRUE, 7);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 55000, TRUE, 8);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Standar 1 Bulan', 40000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Premium 1 Bulan', 45000, TRUE, 2);

    -- [28/56] Produk: Crunchyroll (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Crunchyroll', 12000, NULL, TRUE, 'Official Anime', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Perpustakaan anime terbesar di dunia tayang serentak dengan Jepang.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 12000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 16000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 35000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 18000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 24000, TRUE, 2);

    -- [29/56] Produk: BStation (Bilibili) (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'BStation (Bilibili)', 5000, NULL, TRUE, 'Anime Community', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Komunitas pecinta anime, konten kreator animasi & pop culture terfavorit.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 8000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 11000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 25000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 45000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 1);

    -- [30/56] Produk: RCTI+ (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'RCTI+', 6000, NULL, TRUE, 'TV Nasional', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Live streaming RCTI, MNCTV, GTV, iNews tanpa jeda iklan premium.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 2U', 6000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 2U', 12000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 2U', 15000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 8000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 24000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 38000, TRUE, 4);

    -- [31/56] Produk: Vision+ (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Vision+', 6000, NULL, TRUE, 'PayTV & Sports', 'tv', ARRAY['Sharing PayTV', 'Private PayTV']::TEXT[], 'Channel Pay TV premium, olahraga internasional & Vision+ original series.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing PayTV', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari 2U', 6000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari 2U', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari 2U', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private PayTV', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 10000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 50000, TRUE, 4);

    -- [32/56] Produk: GagaOOLala (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'GagaOOLala', 5000, NULL, TRUE, 'LGBTQ+ Movies', 'tv', ARRAY['Sharing']::TEXT[], 'Katalog film & serial indie Asia terkurasi khusus peminat cinema unik.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 7000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 12000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 30000, TRUE, 5);

    -- [33/56] Produk: Mango TV (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Mango TV', 15000, NULL, TRUE, 'Chinese Reality', 'tv', ARRAY['Sharing']::TEXT[], 'Reality show China terpopuler, idol survival shows & drama eksklusif.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);

    -- [34/56] Produk: Melolo (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Melolo', 8000, NULL, TRUE, 'Short Drama', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Serial pendek drama romantis seru vertikal berdurasi 1 menit per episode.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 8000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 30000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 35000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 40000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 55000, TRUE, 2);

    -- [35/56] Produk: DramaWave (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'DramaWave', 15000, NULL, TRUE, 'Mini Series', 'clapperboard', ARRAY['Sharing Login App', 'Private Login Web']::TEXT[], 'Mini-drama CEO miliarder, time travel & cerita romantis menegangkan.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Login App', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 55000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private Login Web', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 70000, TRUE, 2);

    -- [36/56] Produk: ReelShort (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'ReelShort', 20000, NULL, TRUE, 'Viral Shorts', 'clapperboard', ARRAY['Sharing Login App']::TEXT[], 'Aplikasi drama pendek viral dengan plot twist seru dan adiktif.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Login App', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 38000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 58000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 84000, TRUE, 4);

    -- [37/56] Produk: DramaBox VIP (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'DramaBox VIP', 15000, NULL, TRUE, 'Drama VIP', 'clapperboard', ARRAY['Sharing']::TEXT[], 'Semua episode unlocked bebas koin untuk mini series drama populer.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 60000, TRUE, 3);

    -- [38/56] Produk: ShortMax (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'ShortMax', 20000, NULL, TRUE, 'Micro Cinema', 'clapperboard', ARRAY['Sharing Login App', 'Login Web']::TEXT[], 'Nonton drama pendek berkualitas tinggi di smartphone Anda kapan saja.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Login App', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 45000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 60000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 90000, TRUE, 5);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Login Web', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 7 Hari', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Sharing 1 Bulan', 35000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Private 1 Bulan', 75000, TRUE, 3);

    -- [39/56] Produk: NetShort (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'NetShort', 25000, NULL, TRUE, 'Web Series', 'clapperboard', ARRAY['Sharing Login Web']::TEXT[], 'Streaming drama web eksklusif dengan ribuan cerita baru tiap minggu.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Login Web', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 25000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 2);

    -- [40/56] Produk: Viki Rakuten (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Viki Rakuten', 18000, NULL, TRUE, 'Asian TV', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Koleksi drama Korea, Jepang, Taiwan & China terlengkap dari komunitas penggemar.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Standard', 18000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Plus', 20000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 18000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Standard', 30000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan Plus', 40000, TRUE, 3);

    -- [41/56] Produk: Drakor ID (Streaming Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Drakor ID', 15000, NULL, TRUE, 'Drama Korea', 'tv', ARRAY['Sharing', 'Private']::TEXT[], 'Nonton drakor lancar hemat kuota dengan subtitle bahasa Indonesia resmi.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 35000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 45000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 40000, TRUE, 2);

    -- [42/56] Produk: ChatGPT Go (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'ChatGPT Go', 6000, NULL, TRUE, 'AI Assistant', 'sparkles', ARRAY['Sharing', 'Private']::TEXT[], 'AI cerdas untuk membantu tugas, riset, ringkasan materi & coding cepat.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 6000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 35000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 80000, TRUE, 5);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 65000, TRUE, 1);

    -- [43/56] Produk: ChatGPT Plus (GPT-4o) (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'ChatGPT Plus (GPT-4o)', 10000, NULL, TRUE, 'OpenAI GPT-4o', 'sparkles', ARRAY['Sharing 8U', 'Sharing 5U', 'Sharing 3U', 'Private']::TEXT[], 'Akses model GPT-4o tercepat, analisis data, DALL-E 3 & browsing web instan.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 8U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 10000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 20000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 85000, TRUE, 5);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 5U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 20000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 55000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 3U', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 18000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 35000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 65000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 4)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 170000, TRUE, 1);

    -- [44/56] Produk: Claude Pro (Sonnet 3.5) (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Claude Pro (Sonnet 3.5)', 60000, NULL, TRUE, 'Anthropic AI', 'sparkles', ARRAY['Sharing 5U', 'Sharing 3U', 'Private']::TEXT[], 'Kecerdasan nalar superior, penulisan artikel ilmiah dan coding tingkat master.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 5U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 60000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 150000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 3U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 65000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 170000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 140000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 400000, TRUE, 2);

    -- [45/56] Produk: Grok AI (X Premium) (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Grok AI (X Premium)', 35000, NULL, TRUE, 'xAI Realtime', 'sparkles', ARRAY['Private']::TEXT[], 'AI tanpa sensor dari xAI dengan integrasi data trending real-time Twitter/X.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 50000, TRUE, 2);

    -- [46/56] Produk: Google Gemini Advanced (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Google Gemini Advanced', 25000, NULL, TRUE, 'Google 1.5 Pro', 'sparkles', ARRAY['Sharing 5U', 'Famplan / Invite']::TEXT[], 'Konteks raksasa 1 juta token, terintegrasi langsung dengan Google Workspace.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 5U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 1);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Famplan / Invite', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 40000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 55000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 95000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 120000, TRUE, 5);

    -- [47/56] Produk: Perplexity Pro (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Perplexity Pro', 8000, NULL, TRUE, 'AI Research Engine', 'sparkles', ARRAY['Sharing 5U', 'Private']::TEXT[], 'Mesin pencari berbasis AI dengan sitasi akademik & akses model Claude & GPT.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 5U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 8000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 23000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan (Chat Admin)', 0, TRUE, 1);

    -- [48/56] Produk: Blackbox AI (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Blackbox AI', 0, NULL, TRUE, 'Coding Assistant', 'sparkles', ARRAY['Semua Paket']::TEXT[], 'Asisten pemrograman AI nomor 1 untuk developer, auto-complete & debug kode.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Semua Paket', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Chat Admin (Hubungi Admin)', 0, TRUE, 1);

    -- [49/56] Produk: Microsoft 365 (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Microsoft 365', 15000, NULL, TRUE, 'Word & Excel & 1TB', 'box', ARRAY['Famplan / Invite', 'Head']::TEXT[], 'Office resmi (Word, Excel, PowerPoint) + 1 TB cloud storage OneDrive.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Famplan / Invite', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 25000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 55000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 60000, TRUE, 5);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Head', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 45000, TRUE, 1);

    -- [50/56] Produk: GoodNotes iOS (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'GoodNotes iOS', 30000, NULL, TRUE, 'Digital Notes', 'palette', ARRAY['Paket']::TEXT[], 'Catat kuliah, pdf markup, jurnal & rangkuman buku terpopuler di iPad.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Paket', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime (Garansi 6 Bulan)', 40000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime (Garansi 12 Bulan)', 45000, TRUE, 3);

    -- [51/56] Produk: Duolingo Super (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Duolingo Super', 7000, NULL, TRUE, 'Language Learning', 'sparkles', ARRAY['Famplan / Invite', 'Individual Plan', 'Head']::TEXT[], 'Belajar 40+ bahasa tanpa batas nyawa, tanpa iklan dengan kuis latihan personal.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Famplan / Invite', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 7000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 40000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 70000, TRUE, 6);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Individual Plan', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 18000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 45000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 60000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Head', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 45000, TRUE, 1);

    -- [52/56] Produk: QuillBot Premium (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'QuillBot Premium', 5000, NULL, TRUE, 'Paraphrase Tool', 'sparkles', ARRAY['Sharing 5U', 'Sharing 8U', 'Private']::TEXT[], 'Parafrase kalimat akademik, cek plagiarisme & ringkas teks bahasa Inggris.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 5U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 5000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 7000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 8U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 60000, TRUE, 1);

    -- [53/56] Produk: Grammarly Premium (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Grammarly Premium', 6000, NULL, TRUE, 'Grammar & Style', 'sparkles', ARRAY['Sharing 5U', 'Sharing 8U', 'Education', 'Private']::TEXT[], 'Koreksi tata bahasa Inggris otomatis, saran tone suara dan deteksi AI.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 5U', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 6000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 25000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 8U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 65000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan / Tahun', 55000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Education', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 35000, TRUE, 1);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 4)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 55000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 65000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 75000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '6 Bulan', 100000, TRUE, 4);

    -- [54/56] Produk: Scribd Everand (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Scribd Everand', 15000, NULL, TRUE, 'E-Books & Papers', 'box', ARRAY['Sharing', 'Private']::TEXT[], 'Perpustakaan digital jutaan e-book, audiobook, dokumen kuliah & jurnal.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 20000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 28000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Durasi > 1 Bulan (Tanyakan Admin)', 0, TRUE, 2);

    -- [55/56] Produk: WPS Office Pro (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'WPS Office Pro', 20000, NULL, TRUE, 'Office Suite', 'box', ARRAY['Sharing', 'Private']::TEXT[], 'Alternatif Microsoft Office serba bisa, PDF editor & OCR konversi cepat.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 20000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 30000, TRUE, 2);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 1);

    -- [56/56] Produk: DeepL Pro (Education Apps)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'DeepL Pro', 7000, NULL, TRUE, 'Accurate Translation', 'sparkles', ARRAY['Sharing', 'Sharing 3U', 'Private']::TEXT[], 'Penerjemah paling akurat dan luwes di dunia dengan penerjemahan dokumen utuh.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 7000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 10000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 25000, TRUE, 4);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing 3U', 2)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 50000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 65000, TRUE, 3);

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 3)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Hari', 11000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Hari', 15000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 35000, TRUE, 3);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '14 Hari', 35000, TRUE, 4);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 45000, TRUE, 5);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '2 Bulan', 70000, TRUE, 6);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 90000, TRUE, 7);

END $$;
