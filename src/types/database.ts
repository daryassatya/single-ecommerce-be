export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantOption {
  id: string;
  variant_type_id: string;
  label: string;
  price: number;
  is_available: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ProductVariantType {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  created_at?: string;
  options?: ProductVariantOption[];
  product_variant_options?: ProductVariantOption[];
}

export interface ProductVariantOptionInput {
  id?: string;
  label: string;
  price: number;
  is_available: boolean;
  sort_order?: number;
}

export interface ProductVariantTypeInput {
  id?: string;
  name: string;
  sort_order?: number;
  options: ProductVariantOptionInput[];
}

export interface Product {
  id: string;
  type_id: string | null;
  name: string;
  price: number;
  base_price?: number | null;
  has_variants: boolean;
  badge: string | null;
  icon_name: string;
  variants: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_types?: ProductType | null; // From relation join
  product_variant_types?: ProductVariantType[];
  variant_types?: ProductVariantType[];
}

export interface CustomerMessageSetting {
  id: string;
  setting_key: string;
  title: string;
  description: string | null;
  message_template: string;
  updated_at: string;
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  title: string;
  description: string | null;
  url: string;
  icon_name: string;
  tab_target: string | null;
  is_external: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  product: string;
  text: string;
  is_approved: boolean;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
}

export interface TermsAndCondition {
  id: string;
  category: 'apps' | 'robux' | 'mlbb';
  content: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StoreProfile {
  id: string;
  store_name: string;
  handle: string;
  badge_text: string;
  bio: string;
  whatsapp_number: string;
  is_open: boolean;
  stat_goodies: string;
  stat_folls: string;
  stat_folks: string;
  announcement_text: string;
  marquee_messages: string[];
  updated_at: string;
}

// Form payloads
export type ProductTypeInput = Omit<ProductType, 'id' | 'created_at' | 'updated_at'>;
export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'product_types' | 'product_variant_types' | 'variant_types'> & {
  variant_types?: ProductVariantTypeInput[];
};
export type SocialMediaLinkInput = Omit<SocialMediaLink, 'id' | 'created_at'>;
export type TestimonialInput = Omit<Testimonial, 'id' | 'created_at'>;
export type HeroSlideInput = Omit<HeroSlide, 'id' | 'created_at'>;
export type TermsAndConditionInput = Omit<TermsAndCondition, 'id' | 'created_at'>;
export type StoreProfileInput = Omit<StoreProfile, 'id' | 'updated_at'>;
