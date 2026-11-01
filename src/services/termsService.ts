import { supabase } from '@/lib/supabase';
import { TermsAndCondition, TermsAndConditionInput } from '@/types/database';
import { enforceReadOnly } from '@/lib/displayMode';

export const termsService = {
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

  async create(input: TermsAndConditionInput): Promise<TermsAndCondition> {
    enforceReadOnly('Menambah syarat & ketentuan');
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

  async update(id: string, input: Partial<TermsAndConditionInput>): Promise<TermsAndCondition> {
    enforceReadOnly('Mengubah syarat & ketentuan');
    const { data, error } = await supabase
      .from('terms_and_conditions')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating terms & conditions:', error);
      throw error;
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    enforceReadOnly('Menghapus syarat & ketentuan');
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
