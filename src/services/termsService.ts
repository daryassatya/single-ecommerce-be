import { supabase } from '@/lib/supabase';
import { TermsAndCondition, TermsAndConditionInput } from '@/types/database';

export const termsService = {
  /**
   * Mengambil semua syarat & ketentuan dari database Supabase
   */
  async getAll(): Promise<TermsAndCondition[]> {
    const { data, error } = await supabase
      .from('terms_and_conditions')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching terms & conditions:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Mengambil status master toggle tampilan Terms & Conditions dari store_profile
   */
  async getDisplaySettings(): Promise<{ show_terms: boolean }> {
    try {
      const { data, error } = await supabase
        .from('store_profile')
        .select('show_terms')
        .limit(1)
        .maybeSingle();

      if (!error && data && typeof data.show_terms === 'boolean') {
        return { show_terms: data.show_terms };
      }
    } catch (e) {
      console.warn('Error reading show_terms from store_profile:', e);
    }
    return { show_terms: true };
  },

  /**
   * Mengubah status master switch tampilan Terms & Conditions pada etalase toko
   */
  async toggleDisplayTerms(enabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('store_profile')
        .update({
          show_terms: enabled,
          updated_at: new Date().toISOString(),
        })
        .not('id', 'is', null);

      if (error) {
        console.error('Error updating show_terms in store_profile:', error);
        throw error;
      }
      return enabled;
    } catch (e) {
      console.error('Error toggling show_terms:', e);
      throw e;
    }
  },

  /**
   * Menambahkan poin syarat & ketentuan baru ke database Supabase
   */
  async create(input: TermsAndConditionInput): Promise<TermsAndCondition> {
    const { data, error } = await supabase
      .from('terms_and_conditions')
      .insert([{
        category: input.category,
        content: input.content.trim(),
        sort_order: Number(input.sort_order) || 0,
        is_active: input.is_active ?? true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating terms & conditions:', error);
      throw error;
    }
    return data;
  },

  /**
   * Memperbarui poin syarat & ketentuan di database Supabase
   */
  async update(id: string, input: Partial<TermsAndConditionInput>): Promise<TermsAndCondition> {
    const updatePayload: Record<string, any> = {};
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.content !== undefined) updatePayload.content = input.content.trim();
    if (input.sort_order !== undefined) updatePayload.sort_order = Number(input.sort_order) || 0;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

    const { data, error } = await supabase
      .from('terms_and_conditions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating terms & conditions:', error);
      throw error;
    }
    return data;
  },

  /**
   * Menghapus poin syarat & ketentuan dari database Supabase
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('terms_and_conditions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting terms & conditions:', error);
      throw error;
    }
  },
};
