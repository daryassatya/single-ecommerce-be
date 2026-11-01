-- ==============================================================================
-- SCRIPT RESET & SEED DATA DUMMY BARU (20 PRODUK + PROFIL TOKO + KONTEN CMS)
-- ==============================================================================
-- File ini khusus untuk membersihkan data lama dari tabel dan mengisikan data baru.
--
-- CARA MENJALANKAN DI SUPABASE:
-- 1. Buka dashboard proyek Supabase Anda (https://supabase.com/dashboard)
-- 2. Klik menu 'SQL Editor' di sidebar kiri
-- 3. Klik tombol '+ New query'
-- 4. Copy (Salin) dan Paste (Tempel) seluruh isi skrip ini
-- 5. Klik tombol hijau 'Run'
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. BERSIHKAN SEMUA DATA LAMA DARI TABEL
-- ------------------------------------------------------------------------------
-- Bersihkan tabel varian anak dan produk terlebih dahulu
DELETE FROM public.product_variant_options;
DELETE FROM public.product_variant_types;
DELETE FROM public.products;
DELETE FROM public.product_types;

-- Bersihkan modul CMS dan pengaturan toko lainnya
DELETE FROM public.hero_slides;
DELETE FROM public.testimonials;
DELETE FROM public.terms_and_conditions;
DELETE FROM public.social_media_links;
DELETE FROM public.customer_message_settings;
DELETE FROM public.store_profile;

-- ------------------------------------------------------------------------------
-- 2. PASTIKAN AKUN ADMIN SISTEM TERSEDIA
-- ------------------------------------------------------------------------------
INSERT INTO public.admin_accounts (email, password, name, role)
VALUES 
  ('admin@daryas.tech', '@demo123', 'Admin Demo', 'Super Admin'),
  ('daryassatya@gmail.com', 'tititsayabesar123', 'Darya Satya', 'Super Admin')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, 
    name = EXCLUDED.name, 
    role = EXCLUDED.role,
    updated_at = now();

-- ------------------------------------------------------------------------------
-- 3. SEED KATEGORI / TIPE PRODUK
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. SEED 20 PRODUK BARU & STRUKTUR VARIAN (PARENT-CHILD)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_prod_id UUID;
    v_type_id UUID;
BEGIN

    -- [1/20] Produk: Canva Pro
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Canva Pro', 12000, 35000, TRUE, 'Terlaris', 'palette', ARRAY['Member Invite 1 Bulan', 'Member Invite 1 Tahun', 'Lifetime Desain Tim']::TEXT[], 'Akses jutaan template premium, brand kit, remove background, dan aset grafis tanpa batas.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Paket Akses', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Member Invite 1 Bulan', 12000, TRUE, 1),
        (v_type_id, 'Member Invite 1 Tahun', 45000, TRUE, 2),
        (v_type_id, 'Lifetime Desain Tim', 85000, TRUE, 3);

    -- [2/20] Produk: CapCut Pro
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'CapCut Pro', 15000, 40000, TRUE, 'Creator Choice', 'clapperboard', ARRAY['Sharing 1 Bulan', 'Private 1 Bulan', 'Private 1 Tahun']::TEXT[], 'Editor video tanpa watermark, ratusan transisi pro, text-to-speech AI, dan auto-caption instan.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Sharing 1 Bulan', 15000, TRUE, 1),
        (v_type_id, 'Private 1 Bulan', 45000, TRUE, 2),
        (v_type_id, 'Private 1 Tahun', 145000, TRUE, 3);

    -- [3/20] Produk: ChatGPT Plus (GPT-4o)
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'ChatGPT Plus (GPT-4o)', 35000, 75000, TRUE, 'AI Unggulan', 'sparkles', ARRAY['Sharing 1 Bulan', 'Private Akun Sendiri 1 Bulan']::TEXT[], 'Asisten AI cerdas model reasoning terbaru GPT-4o, DALL-E image generation, dan browsing web.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Tipe Akun', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Sharing 1 Bulan', 35000, TRUE, 1),
        (v_type_id, 'Private Akun Sendiri 1 Bulan', 290000, TRUE, 2);

    -- [4/20] Produk: Claude Pro AI
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Claude Pro AI', 40000, 85000, TRUE, 'Smart Reasoning', 'sparkles', ARRAY['Sharing 1 Bulan', 'Private 1 Bulan']::TEXT[], 'Model AI Sonnet 3.5 dengan analisis data akurat, coding canggih, dan konteks dokumen panjang.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Tipe Akun', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Sharing 1 Bulan', 40000, TRUE, 1),
        (v_type_id, 'Private 1 Bulan', 310000, TRUE, 2);

    -- [5/20] Produk: Microsoft 365 Personal
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Microsoft 365 Personal', 25000, 65000, TRUE, 'Resmi', 'box', ARRAY['1 Bulan + 1TB OneDrive', '1 Tahun + 1TB OneDrive']::TEXT[], 'Word, Excel, PowerPoint resmi plus 1TB Cloud Storage OneDrive untuk produktivitas maksimal.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '1 Bulan + 1TB OneDrive', 25000, TRUE, 1),
        (v_type_id, '1 Tahun + 1TB OneDrive', 185000, TRUE, 2);

    -- [6/20] Produk: Notion Plus Workspace
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Notion Plus Workspace', 30000, 60000, TRUE, 'Produktivitas', 'box', ARRAY['Workspace 6 Bulan', 'Workspace 1 Tahun']::TEXT[], 'Workspace kolaborasi serbaguna dengan upload file tanpa batas dan manajemen proyek modern.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Pilihan', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Workspace 6 Bulan', 45000, TRUE, 1),
        (v_type_id, 'Workspace 1 Tahun', 80000, TRUE, 2);

    -- [7/20] Produk: Mobile Legends Diamonds
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Mobile Legends Diamonds', 19000, 25000, TRUE, 'Top Up Kilat', 'swords', ARRAY['86 Diamonds', '172 Diamonds', '257 Diamonds', 'Weekly Diamond Pass']::TEXT[], 'Top up diamond MLBB resmi via User ID & Zone ID, proses instan 1-5 menit langsung masuk akun.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Nominal', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '86 Diamonds', 19000, TRUE, 1),
        (v_type_id, '172 Diamonds', 38000, TRUE, 2),
        (v_type_id, '257 Diamonds', 56000, TRUE, 3),
        (v_type_id, 'Weekly Diamond Pass', 27500, TRUE, 4);

    -- [8/20] Produk: Steam Wallet IDR Code
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Steam Wallet IDR Code', 13500, 15000, TRUE, 'Kode Instan', 'swords', ARRAY['IDR 12.000', 'IDR 45.000', 'IDR 90.000', 'IDR 250.000']::TEXT[], 'Kode voucher resmi Steam Wallet Indonesia untuk pembelian game dan item favorit langsung di Steam.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Nominal Voucher', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'IDR 12.000', 13500, TRUE, 1),
        (v_type_id, 'IDR 45.000', 48000, TRUE, 2),
        (v_type_id, 'IDR 90.000', 95000, TRUE, 3),
        (v_type_id, 'IDR 250.000', 260000, TRUE, 4);

    -- [9/20] Produk: Netflix Premium UHD 4K
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222', 'Netflix Premium UHD 4K', 25000, 50000, TRUE, 'Terlaris', 'tv', ARRAY['1 Bulan (1 Profil 1 User)', '1 Bulan (Private 4 Layar)', '3 Bulan (1 Profil 1 User)']::TEXT[], 'Streaming film & serial terbaik dunia kualitas 4K UHD tanpa batas, support Smart TV & smartphone.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Paket', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '1 Bulan (1 Profil 1 User)', 25000, TRUE, 1),
        (v_type_id, '1 Bulan (Private 4 Layar)', 140000, TRUE, 2),
        (v_type_id, '3 Bulan (1 Profil 1 User)', 70000, TRUE, 3);

    -- [10/20] Produk: Spotify Premium
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222', 'Spotify Premium', 15000, 30000, TRUE, 'Favorit', 'tv', ARRAY['Individual 1 Bulan', 'Individual 3 Bulan', 'Family Plan 1 Bulan']::TEXT[], 'Dengarkan jutaan lagu tanpa jeda iklan, download playlist offline, dan audio kualitas tertinggi.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Individual 1 Bulan', 15000, TRUE, 1),
        (v_type_id, 'Individual 3 Bulan', 40000, TRUE, 2),
        (v_type_id, 'Family Plan 1 Bulan', 25000, TRUE, 3);

    -- [11/20] Produk: YouTube Premium
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', 'YouTube Premium', 10000, 20000, TRUE, 'Best Deal', 'tv', ARRAY['Famplan Invite 1 Bulan', 'Famplan Invite 3 Bulan', 'Individual Akun Baru']::TEXT[], 'Bebas nonton video tanpa gangguan iklan, putar di latar belakang, dan akses YouTube Music gratis.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Tipe Paket', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Famplan Invite 1 Bulan', 10000, TRUE, 1),
        (v_type_id, 'Famplan Invite 3 Bulan', 28000, TRUE, 2),
        (v_type_id, 'Individual Akun Baru', 22000, TRUE, 3);

    -- [12/20] Produk: Disney+ Hotstar
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', 'Disney+ Hotstar', 30000, 45000, TRUE, 'Populer', 'tv', ARRAY['Basic Plan 1 Bulan', 'Premium 4K 1 Bulan']::TEXT[], 'Koleksi film Marvel, Disney, Pixar, Star Wars, dan konten lokal eksklusif kualitas tinggi.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Paket', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Basic Plan 1 Bulan', 30000, TRUE, 1),
        (v_type_id, 'Premium 4K 1 Bulan', 48000, TRUE, 2);

    -- [13/20] Produk: Amazon Prime Video
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000013', '22222222-2222-2222-2222-222222222222', 'Amazon Prime Video', 15000, 25000, TRUE, 'Hemat', 'tv', ARRAY['1 Bulan Sharing', '1 Bulan Private']::TEXT[], 'Ribuan film blockbuster dan serial Amazon Originals eksklusif dengan resolusi ultra jernih.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Paket', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '1 Bulan Sharing', 15000, TRUE, 1),
        (v_type_id, '1 Bulan Private', 40000, TRUE, 2);

    -- [14/20] Produk: Vidio Premier Platinum
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000014', '22222222-2222-2222-2222-222222222222', 'Vidio Premier Platinum', 20000, 39000, TRUE, 'Sports & Series', 'tv', ARRAY['Platinum 1 Bulan (HP & Tablet)', 'Platinum 1 Bulan (Semua Perangkat)']::TEXT[], 'Nonton siaran langsung olahraga, Premier League, sinetron, dan Vidio Original Series tanpa batas.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, 'Platinum 1 Bulan (HP & Tablet)', 20000, TRUE, 1),
        (v_type_id, 'Platinum 1 Bulan (Semua Perangkat)', 35000, TRUE, 2);

    -- [15/20] Produk: Duolingo Super
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000015', '33333333-3333-3333-3333-333333333333', 'Duolingo Super', 15000, 35000, TRUE, 'Edukasi', 'sparkles', ARRAY['1 Bulan Hati Tak Terbatas', '1 Tahun Hati Tak Terbatas']::TEXT[], 'Belajar bahasa asing lebih lancar tanpa jeda iklan, latihan interaktif, dan hati tak terbatas.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '1 Bulan Hati Tak Terbatas', 15000, TRUE, 1),
        (v_type_id, '1 Tahun Hati Tak Terbatas', 65000, TRUE, 2);

    -- [16/20] Produk: Google One Storage
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000016', '33333333-3333-3333-3333-333333333333', 'Google One Storage', 75000, 120000, TRUE, 'Cloud Resmi', 'box', ARRAY['100GB (1 Tahun)', '2TB (1 Tahun)']::TEXT[], 'Kapasitas penyimpanan ekstra untuk Google Drive, Gmail, dan backup foto resolusi asli Google Photos.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Kapasitas (1 Tahun)', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '100GB (1 Tahun)', 75000, TRUE, 1),
        (v_type_id, '2TB (1 Tahun)', 240000, TRUE, 2);

    -- [17/20] Produk: iCloud+ Storage Upgrade
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000017', '33333333-3333-3333-3333-333333333333', 'iCloud+ Storage Upgrade', 65000, 100000, TRUE, 'Apple Users', 'box', ARRAY['50GB (1 Tahun)', '200GB (1 Tahun)']::TEXT[], 'Upgrade penyimpanan cloud untuk perangkat iPhone, iPad, dan Mac demi kemudahan backup data aman.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Kapasitas', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '50GB (1 Tahun)', 65000, TRUE, 1),
        (v_type_id, '200GB (1 Tahun)', 160000, TRUE, 2);

    -- [18/20] Produk: NordVPN Premium
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000018', '33333333-3333-3333-3333-333333333333', 'NordVPN Premium', 20000, 50000, TRUE, 'Keamanan', 'box', ARRAY['1 Bulan', '6 Bulan', '1 Tahun']::TEXT[], 'Koneksi VPN ultra cepat, enkripsi data kelas militer, bebas browsing dan streaming aman dari mana saja.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '1 Bulan', 20000, TRUE, 1),
        (v_type_id, '6 Bulan', 85000, TRUE, 2),
        (v_type_id, '1 Tahun', 140000, TRUE, 3);

    -- [19/20] Produk: Grammarly Premium
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000019', '33333333-3333-3333-3333-333333333333', 'Grammarly Premium', 20000, 45000, TRUE, 'Akademik', 'sparkles', ARRAY['1 Bulan', '3 Bulan']::TEXT[], 'Cek tata bahasa Inggris profesional, paraphrase pintar, dan rekomendasi kosa kata tulisan akademik.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Durasi', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '1 Bulan', 20000, TRUE, 1),
        (v_type_id, '3 Bulan', 55000, TRUE, 2);

    -- [20/20] Produk: Roblox Robux Instant
    INSERT INTO public.products (id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('00000000-0000-0000-0000-000000000020', '33333333-3333-3333-3333-333333333333', 'Roblox Robux Instant', 18000, 25000, TRUE, 'Legal 100%', 'swords', ARRAY['100 Robux', '400 Robux', '800 Robux']::TEXT[], 'Top up Robux aman dan legal untuk upgrade avatar, akses game pass, dan item eksklusif di Roblox.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Nominal', 1)
    RETURNING id INTO v_type_id;

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_id, '100 Robux', 18000, TRUE, 1),
        (v_type_id, '400 Robux', 65000, TRUE, 2),
        (v_type_id, '800 Robux', 125000, TRUE, 3);

END $$;

-- ------------------------------------------------------------------------------
-- 5. SEED PROFIL TOKO (STORE PROFILE DENGAN NOMOR WA 628888438922)
-- ------------------------------------------------------------------------------
-- Pastikan kolom show_terms tersedia pada tabel store_profile
ALTER TABLE public.store_profile ADD COLUMN IF NOT EXISTS show_terms BOOLEAN NOT NULL DEFAULT TRUE;

INSERT INTO public.store_profile (
    id, store_name, handle, badge_text, bio, whatsapp_number, is_open, 
    stat_goodies, stat_folls, stat_folks, announcement_text, marquee_messages, avatar_url, show_terms
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Contoh Nama Toko',
    '@contohtoko',
    'OFFICIAL STORE & DIGITAL CATALOG',
    'Pusat penyedia produk digital, voucher game, dan langganan aplikasi premium terpercaya dengan garansi resmi dan proses instan.',
    '628888438922',
    TRUE,
    '20',
    '5.4k',
    '12.8k',
    'Katalog Baru! 20 Produk Pilihan Siap Dipesan via WhatsApp 0888-8438-922 ✨',
    ARRAY[
        'Selamat datang di Contoh Nama Toko — Layanan Cepat & Terpercaya 🛒',
        'Layanan Pelanggan Aktif 24/7 via WhatsApp Resmi 💬',
        'Semua transaksi aman menggunakan QRIS dan Bank Transfer 💳',
        'Garansi transaksi resmi & bantuan CS siap sedia 🛡️'
    ]::TEXT[],
    NULL,
    TRUE
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
    show_terms = EXCLUDED.show_terms,
    updated_at = now();

-- ------------------------------------------------------------------------------
-- 6. SEED TEMPLATE PESAN CHECKOUT WHATSAPP
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. SEED MEDIA SOSIAL & QUICK LINKS
-- ------------------------------------------------------------------------------
INSERT INTO public.social_media_links (platform, title, description, url, icon_name, sort_order, is_active, is_external, tab_target)
VALUES
    ('X (Twitter)', 'Profil X', 'x.com/contohtoko • Akun resmi & update harian', 'https://x.com/contohtoko', 'AtSign', 1, TRUE, TRUE, NULL),
    ('WhatsApp', 'WhatsApp Order', '0888-8438-922 • Layanan pesan kilat & fast response', 'https://wa.me/628888438922', 'Send', 2, TRUE, TRUE, NULL),
    ('Telegram', 'Channel Telegram', 't.me/contohtoko • Informasi katalog & promo terkini', 'https://t.me/contohtoko', 'FileCheck2', 3, TRUE, TRUE, NULL),
    ('Review', 'Review Pelanggan', 'Ulasan transaksi sukses dari pelanggan', '#testimonials', 'FileCheck2', 4, TRUE, FALSE, 'testimonials');

-- ------------------------------------------------------------------------------
-- 8. SEED HERO BANNER SLIDES
-- ------------------------------------------------------------------------------
INSERT INTO public.hero_slides (badge, title, description, sort_order, is_active, image_url)
VALUES
    ('PROMO KATALOG', 'Katalog Produk Digital Pilihan ✦', 'Temukan berbagai kebutuhan aplikasi premium, voucher game, dan langganan produktivitas dengan penawaran terbaik.', 1, TRUE, NULL),
    ('PROSES KILAT', 'Transaksi Instan & Otomatis ⚡', 'Proses pesanan kilat dalam hitungan menit, langsung dikonfirmasi oleh customer service ramah 24/7.', 2, TRUE, NULL),
    ('GARANSI 100%', 'Aman, Legal & Bergaransi Penuh 🛡️', 'Setiap transaksi dilindungi garansi resmi dengan metode pembayaran QRIS & Transfer Bank yang mudah.', 3, TRUE, NULL);

-- ------------------------------------------------------------------------------
-- 9. SEED ULASAN PELANGGAN (TESTIMONIALS)
-- ------------------------------------------------------------------------------
INSERT INTO public.testimonials (customer_name, customer_role, rating, product_name, review_text, review_date, sort_order, is_active)
VALUES
    ('Rian Pratama', 'Verified Buyer', 5, 'Netflix Premium UHD 4K', 'Prosesnya cepat banget, ga sampai 5 menit akun langsung aktif. Kualitas 4K lancar tanpa kendala!', '2 hari lalu', 1, TRUE),
    ('Siti Rahmania', 'Verified Buyer', 5, 'Canva Pro', 'Admin ramah dan responsif. Canva Pro langsung masuk ke email pribadi, sangat membantu kerjaan desain.', '3 hari lalu', 2, TRUE),
    ('Dimas Anggara', 'Verified Buyer', 5, 'Mobile Legends Diamonds', 'Top up diamond kilat dan legal 100%, harga bersaing banget dibanding toko lain. Recommended!', '5 hari lalu', 3, TRUE),
    ('Nadia Safitri', 'Verified Buyer', 5, 'Spotify Premium', 'Langganan Spotify individual setahun aman sentosa, no hold no banned. Pelayanan bintang lima!', '1 minggu lalu', 4, TRUE),
    ('Budi Santoso', 'Verified Buyer', 5, 'ChatGPT Plus (GPT-4o)', 'Akses AI lancar untuk riset dan kerjaan kantor. Panduannya jelas dan CS-nya sabar banget.', '1 minggu lalu', 5, TRUE),
    ('Kevin Sanjaya', 'Verified Buyer', 5, 'Steam Wallet IDR Code', 'Kode voucher langsung masuk detik itu juga pas bayar via QRIS. Mantap sekali!', '2 minggu lalu', 6, TRUE);

-- ------------------------------------------------------------------------------
-- 10. SEED ATURAN TOKO (TERMS & CONDITIONS)
-- ------------------------------------------------------------------------------
INSERT INTO public.terms_and_conditions (category, content, sort_order, is_active)
VALUES
    ('apps', '1. Silakan lakukan pembayaran setelah Admin mengirimkan rincian pesanan dan QRIS resmi.', 1, TRUE),
    ('apps', '2. Wajib mengirimkan bukti pembayaran berupa tangkapan layar (screenshot) kepada Admin via WhatsApp 0888-8438-922.', 2, TRUE),
    ('apps', '3. Proses pengerjaan berlangsung sekitar 5–30 menit jika tidak ada antrean panjang.', 3, TRUE),
    ('apps', '4. Garansi penuh berlaku sesuai durasi paket yang dipilih selama mematuhi aturan pemakaian.', 4, TRUE),
    ('apps', '5. Garansi hangus apabila pembeli mengubah sandi akun sharing atau melanggar ketentuan login.', 5, TRUE),
    ('apps', '6. Setelah detail akun dikirimkan, mohon simpan dan pahami panduannya dengan baik.', 6, TRUE),
    ('apps', '7. Kesalahan input dari pihak pembeli tidak dapat diajukan pengembalian dana (non-refundable).', 7, TRUE),
    ('robux', '1. Pastikan username Roblox dan pengaturan Gamepass sudah sesuai panduan Admin.', 1, TRUE),
    ('robux', '2. Bukti pengiriman item akan langsung dikirimkan oleh Admin via WhatsApp.', 2, TRUE),
    ('mlbb', '1. Cukup kirimkan User ID dan Zone ID Mobile Legends Anda (tanpa perlu login akun).', 1, TRUE),
    ('mlbb', '2. Proses top up Diamond masuk dalam 1–10 menit setelah pembayaran terkonfirmasi.', 2, TRUE),
    ('mlbb', '3. Pastikan penulisan User ID + Server sudah benar sebelum konfirmasi pembayaran.', 3, TRUE);

COMMIT;
