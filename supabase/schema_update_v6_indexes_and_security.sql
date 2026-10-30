-- =========================================================================
-- SYAFIRA STORE SCHEMA UPDATE V6: DATABASE QUERY OPTIMIZATIONS & INDEXES
-- Optimizes query performance on foreign keys and active filter fields
-- =========================================================================

-- 1. Products foreign key and filter indexes
CREATE INDEX IF NOT EXISTS idx_products_type_id ON public.products (type_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- 2. Product Variant Types & Options foreign key indexes
CREATE INDEX IF NOT EXISTS idx_pvt_product_id ON public.product_variant_types (product_id);
CREATE INDEX IF NOT EXISTS idx_pvo_variant_type_id ON public.product_variant_options (variant_type_id);
CREATE INDEX IF NOT EXISTS idx_pvo_is_available ON public.product_variant_options (is_available);

-- 3. Social Media Links indexes
CREATE INDEX IF NOT EXISTS idx_social_links_is_active ON public.social_media_links (is_active);
CREATE INDEX IF NOT EXISTS idx_social_links_sort_order ON public.social_media_links (sort_order ASC);

-- 4. Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON public.testimonials (is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials (created_at DESC);

-- 5. Hero Slides indexes
CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON public.hero_slides (is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON public.hero_slides (sort_order ASC);

-- 6. Terms and Conditions indexes
CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms_and_conditions (category);
CREATE INDEX IF NOT EXISTS idx_terms_is_active ON public.terms_and_conditions (is_active);

-- 7. Admin Accounts email index
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts (email);
