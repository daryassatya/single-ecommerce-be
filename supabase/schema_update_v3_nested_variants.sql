-- ==============================================================================
-- SYAFIRA STORE - COMPREHENSIVE SEEDER V4
-- 3 KATEGORI UTAMA & 56 PRODUK LENGKAP (PARENT-CHILD NESTED VARIANTS)
-- ==============================================================================
-- Jalankan script SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qbwqixbfkwdmfcungqom/sql/new
-- ==============================================================================

-- 1. Pastikan kolom has_variants & base_price sudah ada pada tabel products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS base_price NUMERIC(12,2) DEFAULT NULL;

-- 2. Pastikan tabel product_variant_types & product_variant_options ada (ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS public.product_variant_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_variant_types_product_id ON public.product_variant_types(product_id);

CREATE TABLE IF NOT EXISTS public.product_variant_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_type_id UUID NOT NULL REFERENCES public.product_variant_types(id) ON DELETE CASCADE,
    label VARCHAR(150) NOT NULL,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_variant_options_type_id ON public.product_variant_options(variant_type_id);

-- Enable RLS & Policies
ALTER TABLE public.product_variant_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view variant types" ON public.product_variant_types;
CREATE POLICY "Public can view variant types" ON public.product_variant_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow full management on variant types" ON public.product_variant_types;
CREATE POLICY "Allow full management on variant types" ON public.product_variant_types FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.product_variant_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view variant options" ON public.product_variant_options;
CREATE POLICY "Public can view variant options" ON public.product_variant_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow full management on variant options" ON public.product_variant_options;
CREATE POLICY "Allow full management on variant options" ON public.product_variant_options FOR ALL USING (true) WITH CHECK (true);

-- 3. Bersihkan data dummy lama (Opsional tapi direkomendasikan agar bersih)
-- Cascade akan membersihkan product_variant_types & product_variant_options
DELETE FROM public.products;
DELETE FROM public.product_types;

-- 4. Masukkan 3 Kategori Utama
INSERT INTO public.product_types (id, name, slug, description, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Editing Apps', 'editing-apps', 'Aplikasi video & photo editing pro tanpa watermark', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Streaming Apps by Cia', 'streaming-apps', 'Aplikasi streaming film, series, anime & musik premium', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Education Apps by Cia', 'education-apps', 'Aplikasi belajar bahasa, edukasi & produktivitas resmi', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    is_active = TRUE;

-- 5. Masukkan 56 Produk Beserta Nested Variant Types & Options
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

    -- [17/56] Produk: Netflix (Streaming Apps by Cia)
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

    -- [18/56] Produk: Amazon Prime Video (Streaming Apps by Cia)
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

    -- [19/56] Produk: YouTube Premium (Streaming Apps by Cia)
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

    -- [20/56] Produk: Vidio Premier (Streaming Apps by Cia)
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

    -- [21/56] Produk: Disney+ Hotstar (Streaming Apps by Cia)
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

    -- [22/56] Produk: HBO Max / Go (Streaming Apps by Cia)
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

    -- [23/56] Produk: Viu Premium (Streaming Apps by Cia)
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

    -- [24/56] Produk: Youku VIP (Streaming Apps by Cia)
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

    -- [25/56] Produk: Loklok VIP (Streaming Apps by Cia)
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

    -- [26/56] Produk: WeTV VIP (Streaming Apps by Cia)
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

    -- [27/56] Produk: iQIYI VIP (Streaming Apps by Cia)
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

    -- [28/56] Produk: Crunchyroll (Streaming Apps by Cia)
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

    -- [29/56] Produk: BStation (Bilibili) (Streaming Apps by Cia)
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

    -- [30/56] Produk: RCTI+ (Streaming Apps by Cia)
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

    -- [31/56] Produk: Vision+ (Streaming Apps by Cia)
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

    -- [32/56] Produk: GagaOOLala (Streaming Apps by Cia)
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

    -- [33/56] Produk: Mango TV (Streaming Apps by Cia)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Mango TV', 15000, NULL, TRUE, 'Chinese Reality', 'tv', ARRAY['Sharing']::TEXT[], 'Reality show China terpopuler, idol survival shows & drama eksklusif.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 15000, TRUE, 1);

    -- [34/56] Produk: Melolo (Streaming Apps by Cia)
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

    -- [35/56] Produk: DramaWave (Streaming Apps by Cia)
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

    -- [36/56] Produk: ReelShort (Streaming Apps by Cia)
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

    -- [37/56] Produk: DramaBox VIP (Streaming Apps by Cia)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'DramaBox VIP', 15000, NULL, TRUE, 'Drama VIP', 'clapperboard', ARRAY['Sharing']::TEXT[], 'Semua episode unlocked bebas koin untuk mini series drama populer.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 15000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 25000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '3 Bulan', 60000, TRUE, 3);

    -- [38/56] Produk: ShortMax (Streaming Apps by Cia)
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

    -- [39/56] Produk: NetShort (Streaming Apps by Cia)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('22222222-2222-2222-2222-222222222222', 'NetShort', 25000, NULL, TRUE, 'Web Series', 'clapperboard', ARRAY['Sharing Login Web']::TEXT[], 'Streaming drama web eksklusif dengan ribuan cerita baru tiap minggu.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Sharing Login Web', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 25000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 40000, TRUE, 2);

    -- [40/56] Produk: Viki Rakuten (Streaming Apps by Cia)
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

    -- [41/56] Produk: Drakor ID (Streaming Apps by Cia)
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

    -- [42/56] Produk: ChatGPT Go (Education Apps by Cia)
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

    -- [43/56] Produk: ChatGPT Plus (GPT-4o) (Education Apps by Cia)
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

    -- [44/56] Produk: Claude Pro (Sonnet 3.5) (Education Apps by Cia)
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

    -- [45/56] Produk: Grok AI (X Premium) (Education Apps by Cia)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Grok AI (X Premium)', 35000, NULL, TRUE, 'xAI Realtime', 'sparkles', ARRAY['Private']::TEXT[], 'AI tanpa sensor dari xAI dengan integrasi data trending real-time Twitter/X.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Private', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '7 Hari', 35000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Bulan', 50000, TRUE, 2);

    -- [46/56] Produk: Google Gemini Advanced (Education Apps by Cia)
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

    -- [47/56] Produk: Perplexity Pro (Education Apps by Cia)
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

    -- [48/56] Produk: Blackbox AI (Education Apps by Cia)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Blackbox AI', 0, NULL, TRUE, 'Coding Assistant', 'sparkles', ARRAY['Semua Paket']::TEXT[], 'Asisten pemrograman AI nomor 1 untuk developer, auto-complete & debug kode.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Semua Paket', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Chat Admin (Hubungi Admin)', 0, TRUE, 1);

    -- [49/56] Produk: Microsoft 365 (Education Apps by Cia)
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

    -- [50/56] Produk: GoodNotes iOS (Education Apps by Cia)
    INSERT INTO public.products (type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active)
    VALUES ('33333333-3333-3333-3333-333333333333', 'GoodNotes iOS', 30000, NULL, TRUE, 'Digital Notes', 'palette', ARRAY['Paket']::TEXT[], 'Catat kuliah, pdf markup, jurnal & rangkuman buku terpopuler di iPad.', TRUE)
    RETURNING id INTO v_prod_id;

    INSERT INTO public.product_variant_types (product_id, name, sort_order)
    VALUES (v_prod_id, 'Paket', 1)
    RETURNING id INTO v_type_id;
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, '1 Tahun', 30000, TRUE, 1);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime (Garansi 6 Bulan)', 40000, TRUE, 2);
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order) VALUES (v_type_id, 'Lifetime (Garansi 12 Bulan)', 45000, TRUE, 3);

    -- [51/56] Produk: Duolingo Super (Education Apps by Cia)
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

    -- [52/56] Produk: QuillBot Premium (Education Apps by Cia)
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

    -- [53/56] Produk: Grammarly Premium (Education Apps by Cia)
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

    -- [54/56] Produk: Scribd Everand (Education Apps by Cia)
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

    -- [55/56] Produk: WPS Office Pro (Education Apps by Cia)
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

    -- [56/56] Produk: DeepL Pro (Education Apps by Cia)
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
