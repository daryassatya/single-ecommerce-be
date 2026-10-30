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
-- Contoh: "Gemini AI Plus", "Gemini AI Pro", "Gemini AI Ultra"
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
-- Contoh: "1 Bulan", "1 Tahun" (Harga akhir ditentukan di level ini)
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
-- 4. SEED DATA CONTOH: Google Gemini Subscription (2-Tier Nested Variants)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_app_type_id UUID;
    v_product_id UUID := '77777777-7777-7777-7777-777777777777'::UUID;
    v_type_plus_id UUID := '88888888-8888-8888-8888-888888888881'::UUID;
    v_type_pro_id UUID := '88888888-8888-8888-8888-888888888882'::UUID;
    v_type_ultra_id UUID := '88888888-8888-8888-8888-888888888883'::UUID;
BEGIN
    -- Ambil ID kategori App jika ada
    SELECT id INTO v_app_type_id FROM public.product_types WHERE slug ILIKE '%app%' LIMIT 1;

    -- 4a. Insert / Upsert Produk Utama Google Gemini Subscription
    INSERT INTO public.products (
        id, 
        type_id, 
        name, 
        price, 
        base_price, 
        has_variants, 
        badge, 
        icon_name, 
        variants, 
        description, 
        is_active
    ) VALUES (
        v_product_id,
        v_app_type_id,
        'Google Gemini Subscription',
        50000,
        NULL,
        TRUE,
        'AI · 3 Tipe',
        'Sparkles',
        ARRAY['Gemini AI Plus', 'Gemini AI Pro', 'Gemini AI Ultra']::TEXT[],
        'Langganan resmi Google Gemini AI berjenjang (Plus, Pro, Ultra) dengan opsi durasi 1 Bulan atau 1 Tahun.',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        has_variants = TRUE,
        base_price = NULL,
        badge = EXCLUDED.badge,
        icon_name = EXCLUDED.icon_name,
        description = EXCLUDED.description,
        is_active = TRUE;

    -- 4b. Bersihkan varian lama untuk produk ini agar tidak duplikat
    DELETE FROM public.product_variant_types WHERE product_id = v_product_id;

    -- 4c. Level 1: Insert Variant Types
    INSERT INTO public.product_variant_types (id, product_id, name, sort_order)
    VALUES 
        (v_type_plus_id, v_product_id, 'Gemini AI Plus', 1),
        (v_type_pro_id, v_product_id, 'Gemini AI Pro', 2),
        (v_type_ultra_id, v_product_id, 'Gemini AI Ultra', 3);

    -- 4d. Level 2: Insert Variant Options dengan Harga Final Masing-masing
    -- Plus options
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_plus_id, '1 Bulan', 50000, TRUE, 1),
        (v_type_plus_id, '1 Tahun', 500000, TRUE, 2);

    -- Pro options
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_pro_id, '1 Bulan', 150000, TRUE, 1),
        (v_type_pro_id, '1 Tahun', 1500000, TRUE, 2);

    -- Ultra options
    INSERT INTO public.product_variant_options (variant_type_id, label, price, is_available, sort_order)
    VALUES
        (v_type_ultra_id, '1 Bulan', 300000, TRUE, 1),
        (v_type_ultra_id, '1 Tahun', 3000000, TRUE, 2);

END $$;
