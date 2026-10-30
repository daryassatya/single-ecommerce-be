-- ==============================================================================
-- SYAFIRA STORE CMS & ADMIN DASHBOARD - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Jalankan script SQL ini di Supabase SQL Editor untuk membuat tabel, relasi,
-- kebijakan RLS (Row Level Security), dan initial seed data yang sinkron
-- dengan Syafira Store.
-- ==============================================================================

-- 0. Enable UUID Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABEL: product_types (Kategori / Tipe Produk)
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

-- Index untuk pencarian cepat berdasarkan slug dan is_active
CREATE INDEX IF NOT EXISTS idx_product_types_slug ON public.product_types(slug);
CREATE INDEX IF NOT EXISTS idx_product_types_is_active ON public.product_types(is_active);

-- ------------------------------------------------------------------------------
-- 2. TABEL: products (Katalog Produk berbasis Lucide Icon, Tanpa Gambar)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID REFERENCES public.product_types(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    badge VARCHAR(100),
    icon_name VARCHAR(100) NOT NULL DEFAULT 'Package',
    variants TEXT[] DEFAULT '{}'::TEXT[],
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk relasi dan filter
CREATE INDEX IF NOT EXISTS idx_products_type_id ON public.products(type_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ------------------------------------------------------------------------------
-- 3. TABEL: customer_message_settings (Template Pesan Otomatis Customer)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_message_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL DEFAULT 'default_order_message',
    title VARCHAR(150) NOT NULL DEFAULT 'Template Pesan Order WhatsApp',
    description TEXT DEFAULT 'Template pesan yang otomatis dibuat ketika customer memilih produk untuk checkout via WhatsApp.',
    message_template TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. TABEL: social_media_links (Daftar Tautan Sosial Media Toko)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_media_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    url TEXT NOT NULL,
    icon_name VARCHAR(100) NOT NULL DEFAULT 'Share2',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_social_links_sort ON public.social_media_links(sort_order ASC);

-- ------------------------------------------------------------------------------
-- 5. FUNCTION & TRIGGER: Auto Update updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Aktifkan RLS di seluruh tabel
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_message_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Policy product_types: Izinkan baca publik & manajemen penuh oleh anon/authenticated CMS
DROP POLICY IF EXISTS "Public can view active product types" ON public.product_types;
CREATE POLICY "Public can view active product types" ON public.product_types
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on product_types" ON public.product_types;
CREATE POLICY "Allow full management on product_types" ON public.product_types
    FOR ALL USING (true) WITH CHECK (true);

-- Policy products: Izinkan baca publik & manajemen penuh oleh anon/authenticated CMS
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on products" ON public.products;
CREATE POLICY "Allow full management on products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);

-- Policy customer_message_settings: Izinkan baca & update setting
DROP POLICY IF EXISTS "Public can view message settings" ON public.customer_message_settings;
CREATE POLICY "Public can view message settings" ON public.customer_message_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on customer_message_settings" ON public.customer_message_settings;
CREATE POLICY "Allow full management on customer_message_settings" ON public.customer_message_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Policy social_media_links: Izinkan baca & manajemen link
DROP POLICY IF EXISTS "Public can view social media links" ON public.social_media_links;
CREATE POLICY "Public can view social media links" ON public.social_media_links
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full management on social_media_links" ON public.social_media_links;
CREATE POLICY "Allow full management on social_media_links" ON public.social_media_links
    FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. INITIAL SEED DATA (SINKRON DENGAN SYAFIRA STORE FRONTEND)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    app_type_id UUID;
    game_type_id UUID;
BEGIN
    -- Masukkan Kategori/Tipe Produk jika belum ada
    INSERT INTO public.product_types (id, name, slug, description, is_active)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Aplikasi Premium', 'app', 'Langganan aplikasi streaming, produktivitas, dan AI', TRUE),
        ('22222222-2222-2222-2222-222222222222', 'Game Top Up', 'game', 'Top up diamond game dan robux resmi bergaransi', TRUE)
    ON CONFLICT (slug) DO UPDATE 
    SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO app_type_id;

    -- Masukkan Produk Awal berbasis Lucide Icon
    INSERT INTO public.products (name, type_id, price, badge, icon_name, variants, description, is_active)
    VALUES
        ('ChatGPT Plus', '11111111-1111-1111-1111-111111111111', 10000, 'AI · 5 varian', 'Sparkles', ARRAY['Sharing 7 Hari', 'Sharing 1 Bulan', 'Private 1 Bulan'], 'Akses GPT-4o, DALL-E, dan fitur analisis data tanpa antre.', TRUE),
        ('Canva Pro', '11111111-1111-1111-1111-111111111111', 3000, 'Desain · 1 varian', 'Palette', ARRAY['Invite Email 1 Bulan', 'Invite Email 1 Tahun'], 'Buka semua template premium, hapus background instan, dan export kualitas ultra.', TRUE),
        ('DramaBox VIP', '11111111-1111-1111-1111-111111111111', 15000, 'Drama · 2 varian', 'Clapperboard', ARRAY['Sharing 1 Bulan', 'Private 1 Bulan'], 'Nonton drama pendek viral subtitle Indonesia tanpa koin.', TRUE),
        ('Netflix Premium', '11111111-1111-1111-1111-111111111111', 8000, 'Streaming · 2 varian', 'Tv', ARRAY['1 Profile 1 Bulan UHD', 'Private 1 Bulan'], 'Kualitas Ultra HD 4K, profil aman ber-PIN, legal dan bergaransi.', TRUE),
        ('Mobile Legends', '22222222-2222-2222-2222-222222222222', 17000, 'Game · 8 varian', 'Swords', ARRAY['Weekly Diamond Pass', '86 Diamonds', '172 Diamonds', '257 Diamonds'], 'Top up via User ID & Zone ID, proses 1-5 menit langsung masuk.', TRUE),
        ('Robux Roblox', '22222222-2222-2222-2222-222222222222', 16000, 'Game · 1 varian', 'Box', ARRAY['100 Robux via Send', '500 Robux via Send', '1000 Robux via Send'], 'Robux legal via Gamepass/Send, garansi aman dari ban.', TRUE)
    ON CONFLICT DO NOTHING;

    -- Masukkan Template Pesan Default
    INSERT INTO public.customer_message_settings (setting_key, title, description, message_template)
    VALUES (
        'default_order_message',
        'Template Pesan Order WhatsApp',
        'Format pesan pemesanan yang otomatis dihasilkan saat pelanggan memilih produk di Syafira Store.',
        E'Halo Admin Syafira Store! ✨\nSaya ingin memesan produk berikut:\n\n🛍️ Produk: {nama_produk}\n📂 Kategori: {tipe_produk}\n💰 Harga: {harga}\n📝 Keterangan: {deskripsi}\n\nMohon bantu proses pesanan saya ya. Terima kasih! 🩵'
    )
    ON CONFLICT (setting_key) DO UPDATE 
    SET title = EXCLUDED.title, message_template = EXCLUDED.message_template;

    -- Masukkan Social Media Links
    INSERT INTO public.social_media_links (platform, title, url, icon_name, sort_order, is_active)
    VALUES
        ('WhatsApp', 'WhatsApp Group', 'https://chat.whatsapp.com/example-syafira', 'Users', 1, TRUE),
        ('WhatsApp', 'WhatsApp Channel', 'https://whatsapp.com/channel/example-syafira', 'Radio', 2, TRUE),
        ('Discord', 'Discord Community', 'https://discord.gg/example-syafira', 'Gamepad2', 3, TRUE),
        ('Twitter / X', 'X (@syafirastore)', 'https://x.com/syafirastore', 'AtSign', 4, TRUE),
        ('Telegram', 'Telegram Channel', 'https://t.me/syafirastore', 'Send', 5, TRUE)
    ON CONFLICT DO NOTHING;

END $$;
