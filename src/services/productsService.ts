import { supabase } from '@/lib/supabase';
import { Product, ProductInput } from '@/types/database';

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
    return data;
  },

  async create(input: ProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([input])
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
    return data;
  },

  async toggleActive(id: string, currentStatus: boolean): Promise<Product> {
    return this.update(id, { is_active: !currentStatus });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};
