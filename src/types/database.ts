export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  type_id: string | null;
  name: string;
  price: number;
  badge: string | null;
  icon_name: string;
  variants: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_types?: ProductType | null; // From relation join
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
  url: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Form payloads
export type ProductTypeInput = Omit<ProductType, 'id' | 'created_at' | 'updated_at'>;
export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'product_types'>;
export type SocialMediaLinkInput = Omit<SocialMediaLink, 'id' | 'created_at'>;
