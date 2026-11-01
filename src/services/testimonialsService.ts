import { supabase } from '@/lib/supabase';
import { Testimonial, TestimonialInput } from '@/types/database';
import { enforceReadOnly } from '@/lib/displayMode';

export const testimonialsService = {
  async getAll(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
    return data || [];
  },

  async create(input: TestimonialInput): Promise<Testimonial> {
    enforceReadOnly('Menambah ulasan pembeli');
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        name: input.name.trim(),
        product: input.product.trim(),
        text: input.text.trim(),
        is_approved: input.is_approved ?? true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, input: Partial<TestimonialInput>): Promise<Testimonial> {
    enforceReadOnly('Mengubah status ulasan pembeli');
    const { data, error } = await supabase
      .from('testimonials')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
    return data;
  },

  async toggleApproval(id: string, is_approved: boolean): Promise<Testimonial> {
    return this.update(id, { is_approved });
  },

  async delete(id: string): Promise<void> {
    enforceReadOnly('Menghapus ulasan pembeli');
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  },
};
