-- ==============================================================================
-- SYAFIRA STORE - SCHEMA UPDATE V3: 2-TIER NESTED VARIANTS
-- (PARENT-CHILD / BERJENJANG 2 TINGKAT: JENIS -> OPSI DURASI & HARGA)
-- ==============================================================================
-- Jalankan script SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qbwqixbfkwdmfcungqom/sql/new
-- ==============================================================================

-- 1. Tambah kolom has_variants & base_price pada tabel products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS base_price NUMERIC(12,2) DEFAULT NULL;

-- Sinkronisasi base_price dengan price yang sudah ada untuk produk tanpa varian
UPDATE public.products 
SET base_price = price 
WHERE base_price IS NULL AND has_variants = FALSE;

-- ------------------------------------------------------------------------------
-- 2. TABEL: product_variant_types (Level 1 — Jenis / Parent Variant)
-- Relasi: product_id -> products.id (ON DELETE CASCADE)
-- Contoh: "Sharing 3U", "Sharing 2U", "Private", "Member", "Plus", "Pro"
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variant_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index foreign key untuk performa join query
CREATE INDEX IF NOT EXISTS idx_variant_types_product_id 
ON public.product_variant_types(product_id);

-- Enable RLS
ALTER TABLE public.product_variant_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view variant types" ON public.product_variant_types;
CREATE POLICY "Public can view variant types" ON public.product_variant_types
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on variant types" ON public.product_variant_types;
CREATE POLICY "Allow full management on variant types" ON public.product_variant_types
    FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. TABEL: product_variant_options (Level 2 — Opsi / Child Variant)
-- Relasi: variant_type_id -> product_variant_types.id (ON DELETE CASCADE)
-- Contoh: "1 Hari", "1 Bulan", "1 Tahun" (Harga akhir ditentukan di level ini)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variant_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_type_id UUID NOT NULL REFERENCES public.product_variant_types(id) ON DELETE CASCADE,
    label VARCHAR(150) NOT NULL,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index foreign key untuk performa join query
CREATE INDEX IF NOT EXISTS idx_variant_options_type_id 
ON public.product_variant_options(variant_type_id);

-- Enable RLS
ALTER TABLE public.product_variant_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view variant options" ON public.product_variant_options;
CREATE POLICY "Public can view variant options" ON public.product_variant_options
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on variant options" ON public.product_variant_options;
CREATE POLICY "Allow full management on variant options" ON public.product_variant_options
    FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. KATEGORI UTAMA SYAFIRA STORE (Editing, Streaming, Education)
-- ------------------------------------------------------------------------------
INSERT INTO public.product_types (id, name, slug, description, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111'::UUID, 'Editing Apps', 'editing-apps', 'Aplikasi video & photo editing pro tanpa watermark', TRUE),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'Streaming Apps by Cia', 'streaming-apps', 'Aplikasi streaming film, series, anime & musik premium', TRUE),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'Education Apps by Cia', 'education-apps', 'Aplikasi belajar bahasa, edukasi & produktivitas resmi', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    is_active = TRUE;

-- ------------------------------------------------------------------------------
-- 5. SEED DATA CONTOH: CapCut Pro & Google Gemini Subscription (2-Tier Nested)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_edit_type_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
    v_stream_type_id UUID := '22222222-2222-2222-2222-222222222222'::UUID;
    
    -- CapCut Pro
    v_capcut_id UUID := '77777777-7777-7777-7777-777777777771'::UUID;
    v_cc_s3u UUID := '88888888-8888-8888-8888-888888888871'::UUID;
    v_cc_s2u UUID := '88888888-8888-8888-8888-888888888872'::UUID;
    v_cc_priv UUID := '88888888-8888-8888-8888-888888888873'::UUID;

    -- Google Gemini
    v_gemini_id UUID := '77777777-7777-7777-7777-777777777772'::UUID;
    v_gem_plus UUID := '88888888-8888-8888-8888-888888888881'::UUID;
    v_gem_pro UUID := '88888888-8888-8888-8888-888888888882'::UUID;
    v_gem_ultra UUID := '88888888-8888-8888-8888-888888888883'::UUID;
BEGIN
    -- 5a. Insert / Upsert CapCut Pro
    INSERT INTO public.products (
        id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active
    ) VALUES (
        v_capcut_id,
        v_edit_type_id,
        'CapCut Pro',
        8000,
        NULL,
        TRUE,
        'Editing • 3 Tipe',
        'clapperboard',
        ARRAY['Sharing 3U', 'Sharing 2U', 'Private']::TEXT[],
        'Aplikasi video editor pro tanpa watermark dengan fitur AI & cloud storage.',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        has_variants = TRUE,
        base_price = NULL,
        is_active = TRUE;

    DELETE FROM public.product_variant_types WHERE product_id = v_capcut_id;

    INSERT INTO public.product_variant_types (id, product_id, name, sort_order)
    VALUES
        (v_cc_s3u, v_capcut_id, 'Sharing 3U', 1),
        (v_cc_s2u, v_capcut_id, 'Sharing 2U', 2),
        (v_cc_priv, v_capcut_id, 'Private', 3);

    -- Level 2 Options for CapCut Pro
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_cc_s3u, '1 Hari', 8000, TRUE, 1),
        (v_cc_s3u, '3 Hari', 12000, TRUE, 2),
        (v_cc_s3u, '7 Hari', 17000, TRUE, 3),
        (v_cc_s3u, '1 Bulan', 35000, TRUE, 4),
        (v_cc_s2u, '1 Hari', 9000, TRUE, 1),
        (v_cc_s2u, '3 Hari', 15000, TRUE, 2),
        (v_cc_s2u, '7 Hari', 20000, TRUE, 3),
        (v_cc_s2u, '1 Bulan', 45000, TRUE, 4),
        (v_cc_priv, '1 Hari', 10000, TRUE, 1),
        (v_cc_priv, '3 Hari', 18000, TRUE, 2),
        (v_cc_priv, '7 Hari', 25000, TRUE, 3),
        (v_cc_priv, '1 Bulan (Tanyakan Admin)', 0, TRUE, 4);

    -- 5b. Insert / Upsert Google Gemini Subscription
    INSERT INTO public.products (
        id, type_id, name, price, base_price, has_variants, badge, icon_name, variants, description, is_active
    ) VALUES (
        v_gemini_id,
        v_stream_type_id,
        'Google Gemini Subscription',
        50000,
        NULL,
        TRUE,
        'AI • 3 Tipe',
        'sparkles',
        ARRAY['Gemini AI Plus', 'Gemini AI Pro', 'Gemini AI Ultra']::TEXT[],
        'Langganan resmi Google Gemini AI berjenjang (Plus, Pro, Ultra) dengan opsi durasi 1 Bulan atau 1 Tahun.',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        has_variants = TRUE,
        base_price = NULL,
        is_active = TRUE;

    DELETE FROM public.product_variant_types WHERE product_id = v_gemini_id;

    INSERT INTO public.product_variant_types (id, product_id, name, sort_order)
    VALUES
        (v_gem_plus, v_gemini_id, 'Gemini AI Plus', 1),
        (v_gem_pro, v_gemini_id, 'Gemini AI Pro', 2),
        (v_gem_ultra, v_gemini_id, 'Gemini AI Ultra', 3);

    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_gem_plus, '1 Bulan', 50000, TRUE, 1),
        (v_gem_plus, '1 Tahun', 500000, TRUE, 2),
        (v_gem_pro, '1 Bulan', 150000, TRUE, 1),
        (v_gem_pro, '1 Tahun', 1500000, TRUE, 2),
        (v_gem_ultra, '1 Bulan', 300000, TRUE, 1),
        (v_gem_ultra, '1 Tahun', 3000000, TRUE, 2);

END $$;
