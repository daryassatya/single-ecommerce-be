import { supabase } from '@/lib/supabase';
import { ProductType, ProductTypeInput } from '@/types/database';

export const productTypesService = {
  async getAll(): Promise<ProductType[]> {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
    return data || [];
  },

  async getById(id: string): Promise<ProductType | null> {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product type with id ${id}:`, error);
      throw error;
    }
    return data;
  },

  async create(input: ProductTypeInput): Promise<ProductType> {
    const { data, error } = await supabase
      .from('product_types')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating product type:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, input: Partial<ProductTypeInput>): Promise<ProductType> {
    const { data, error } = await supabase
      .from('product_types')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating product type ${id}:`, error);
      throw error;
    }
    return data;
  },

  async toggleActive(id: string, currentStatus: boolean): Promise<ProductType> {
    return this.update(id, { is_active: !currentStatus });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting product type ${id}:`, error);
      throw error;
    }
  },
};
