-- ==============================================================================
-- SYAFIRA STORE - SCHEMA UPDATE V2 (ALL FRONTEND CRUD CAPABILITIES)
-- ==============================================================================
-- Jalankan script SQL ini di Supabase SQL Editor untuk menambahkan tabel
-- Testimoni, Hero Slides, Syarat & Ketentuan (T&C), Profil Toko, dan update kolom Social Media.
-- ==============================================================================

-- 1. Tambah kolom deskripsi, is_external, dan tab_target pada tabel social_media_links
ALTER TABLE public.social_media_links 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS tab_target VARCHAR(50) DEFAULT NULL;

-- Update data social media agar persis sesuai FE constants.ts
UPDATE public.social_media_links 
SET description = 'Diskusi & info restock kilat', is_external = TRUE 
WHERE title ILIKE '%Group%';

UPDATE public.social_media_links 
SET description = 'Katalog harga & promo harian', is_external = TRUE 
WHERE title ILIKE '%Channel%' AND platform = 'WhatsApp';

UPDATE public.social_media_links 
SET description = 'Komunitas mabar Roblox & MLBB', is_external = TRUE 
WHERE platform = 'Discord';

UPDATE public.social_media_links 
SET description = 'Thread bukti & giveaway mingguan', is_external = TRUE 
WHERE platform ILIKE '%Twitter%' OR platform ILIKE '%X%';

UPDATE public.social_media_links 
SET description = 'Notifikasi stok otomatis 24/7', is_external = TRUE 
WHERE platform = 'Telegram';

-- Tambahkan link Payment Proof (menuju tab Testimoni di FE)
INSERT INTO public.social_media_links (platform, title, description, url, icon_name, sort_order, is_active, is_external, tab_target)
VALUES (
    'Review', 
    'Payment Proof', 
    '4.100+ transaksi sukses & ulasan', 
    '#testimonials', 
    'FileCheck2', 
    6, 
    TRUE, 
    FALSE, 
    'testimonials'
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. TABEL: testimonials (Ulasan & Bukti Pembayaran Pelanggan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    product VARCHAR(150) NOT NULL,
    text TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
CREATE POLICY "Public can view approved testimonials" ON public.testimonials
    FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
CREATE POLICY "Public can submit testimonials" ON public.testimonials
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full management on testimonials" ON public.testimonials;
CREATE POLICY "Allow full management on testimonials" ON public.testimonials
    FOR ALL USING (true) WITH CHECK (true);

-- Seed data ulasan awal sesuai FE constants.ts
INSERT INTO public.testimonials (name, product, text, is_approved)
VALUES
    ('zee', 'Robux Roblox', 'sangat amat fast respon di Syafira Store, ada masalah langsung diselesain saat itu juga lop deh 🫶', TRUE),
    ('shenziyy', 'Canva Pro', 'kakak Syafira ramahh, proses cepet, fast respon jugaa terus murcee, bakal repurchase lagii nantii ✨', TRUE),
    ('difa', 'Netflix Premium', 'proses pengerjaan cepet dan fastrespon banget kakaknya!! sangat amat trusted tysm kaa 🤍', TRUE),
    ('cicakk', 'Mobile Legends', 'luvvv banget soalnya satset jujur rekomen banget buat beli WDP dan robux di Syafira Store 🫱🫲', TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. TABEL: hero_slides (Banner Slider Sambutan Bagian Atas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_sort ON public.hero_slides(sort_order ASC);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active hero slides" ON public.hero_slides;
CREATE POLICY "Public can view active hero slides" ON public.hero_slides
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow full management on hero_slides" ON public.hero_slides;
CREATE POLICY "Allow full management on hero_slides" ON public.hero_slides
    FOR ALL USING (true) WITH CHECK (true);

-- Seed data slide hero awal sesuai FE constants.ts
INSERT INTO public.hero_slides (badge, title, description, sort_order, is_active)
VALUES
    ('SYAFIRA DIGITAL WORLD', 'Welcome to Syafira Land! ✦˚𝜗𝜚.ᐟ', 'Tempat paling nyaman buat top up game & langganan aplikasi premium dengan warna baru yang segar.', 1, TRUE),
    ('FAST PROCESS 5-30 MINS', 'Robux & MLBB Ready 24/7 🎮', 'Proses kilat, legal, dan bergaransi penuh langsung dipandu oleh Admin Syafira.', 2, TRUE),
    ('PREMIUM APPS BUNDLE', 'Netflix, Canva & ChatGPT Plus ✨', 'Mulai dari Rp 3.000 saja untuk menunjang produktivitas dan hiburan harianmu.', 3, TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. TABEL: terms_and_conditions (Syarat & Ketentuan Layanan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.terms_and_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'apps', 'robux', 'mlbb'
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms_and_conditions(category);

ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active terms" ON public.terms_and_conditions;
CREATE POLICY "Public can view active terms" ON public.terms_and_conditions
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow full management on terms_and_conditions" ON public.terms_and_conditions;
CREATE POLICY "Allow full management on terms_and_conditions" ON public.terms_and_conditions
    FOR ALL USING (true) WITH CHECK (true);

-- Seed data T&C awal sesuai FE constants.ts
INSERT INTO public.terms_and_conditions (category, content, sort_order, is_active)
VALUES
    ('apps', '1. Silakan lakukan pembayaran setelah Admin Syafira mengirimkan rincian pesanan dan QRIS resmi.', 1, TRUE),
    ('apps', '2. Wajib mengirimkan bukti pembayaran berupa tangkapan layar (screenshot) kepada Admin Syafira Store.', 2, TRUE),
    ('apps', '3. Proses pengerjaan berlangsung sekitar 5–30 menit jika tidak ada antrean panjang.', 3, TRUE),
    ('apps', '4. Garansi penuh berlaku sesuai durasi paket yang dipilih selama mematuhi aturan pemakaian.', 4, TRUE),
    ('apps', '5. Garansi hangus apabila pembeli mengubah sandi akun sharing atau melanggar ketentuan login.', 5, TRUE),
    ('apps', '6. Setelah detail akun dikirimkan, mohon simpan dan pahami panduannya dengan baik.', 6, TRUE),
    ('apps', '7. Kesalahan input dari pihak pembeli tidak dapat diajukan pengembalian dana (non-refundable).', 7, TRUE),
    ('robux', '1. Pastikan username Roblox dan pengaturan Gamepass sudah sesuai panduan Admin Syafira.', 1, TRUE),
    ('robux', '2. Robux via Gamepass/Send membutuhkan waktu pending 5 hari sesuai sistem resmi Roblox.', 2, TRUE),
    ('robux', '3. Bukti pengiriman Robux akan langsung dikirimkan berupa screenshot oleh Admin Syafira.', 3, TRUE),
    ('mlbb', '1. Cukup kirimkan User ID dan Zone ID Mobile Legends Anda (tanpa perlu login akun).', 1, TRUE),
    ('mlbb', '2. Proses top-up Diamond dan Weekly Diamond Pass masuk dalam 1–10 menit setelah pembayaran terkonfirmasi.', 2, TRUE),
    ('mlbb', '3. Pastikan penulisan User ID + Server sudah benar sebelum konfirmasi.', 3, TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. TABEL: store_profile (Pengaturan Bio Toko, Jam Buka, Stats & Ticker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(150) NOT NULL DEFAULT 'Cia Store ✦˚𝜗𝜚.ᐟ',
    handle VARCHAR(100) NOT NULL DEFAULT '@ciastore',
    badge_text VARCHAR(100) NOT NULL DEFAULT 'GAME AND APPS NEEDS',
    bio TEXT NOT NULL DEFAULT 'welcome bestie! 🦋 🎀 game needs & apps premium ✩💬👧🏻✨ trusted only ♡🌟 ִֶָ',
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '6281400688284',
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    stat_goodies VARCHAR(50) NOT NULL DEFAULT '52',
    stat_folls VARCHAR(50) NOT NULL DEFAULT '3.2k',
    stat_folks VARCHAR(50) NOT NULL DEFAULT '4.1k',
    announcement_text TEXT NOT NULL DEFAULT 'Promo Cia Store: Diskon Rp 2.000 untuk pembelian bundel Netflix + Canva Pro hari ini!',
    marquee_messages TEXT[] NOT NULL DEFAULT ARRAY[
        'check product details before ordering ✦',
        'made with love & pixel magic by Cia Store ✦',
        'thank you for shopping small & supporting Cia ✦',
        'fast response 5–30 minutes process ✦',
        'legal, safe & guaranteed warranty ✦'
    ]::TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.store_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view store profile" ON public.store_profile;
CREATE POLICY "Public can view store profile" ON public.store_profile
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on store_profile" ON public.store_profile;
CREATE POLICY "Allow full management on store_profile" ON public.store_profile
    FOR ALL USING (true) WITH CHECK (true);

-- Seed profil default
INSERT INTO public.store_profile (id, store_name, handle, badge_text, bio, whatsapp_number, is_open, stat_goodies, stat_folls, stat_folks, announcement_text)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Cia Store ✦˚𝜗𝜚.ᐟ',
    '@ciastore',
    'GAME AND APPS NEEDS',
    'welcome bestie! 🦋 🎀 game needs & apps premium ✩💬👧🏻✨ trusted only ♡🌟 ִֶָ',
    '6281400688284',
    TRUE,
    '52',
    '3.2k',
    '4.1k',
    'Promo Cia Store: Diskon Rp 2.000 untuk pembelian bundel Netflix + Canva Pro hari ini!'
)
ON CONFLICT (id) DO UPDATE
SET store_name = EXCLUDED.store_name, bio = EXCLUDED.bio, whatsapp_number = EXCLUDED.whatsapp_number;
