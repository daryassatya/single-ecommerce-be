import { supabase } from '@/lib/supabase';
import { HeroSlide, HeroSlideInput } from '@/types/database';

export const heroSlidesService = {
  async getAll(): Promise<HeroSlide[]> {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching hero slides:', error);
      throw error;
    }
    return data || [];
  },

  async create(input: HeroSlideInput): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{
        badge: input.badge.trim(),
        title: input.title.trim(),
        description: input.description.trim(),
        sort_order: Number(input.sort_order) || 0,
        is_active: input.is_active ?? true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating hero slide:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, input: Partial<HeroSlideInput>): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating hero slide:', error);
      throw error;
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting hero slide:', error);
      throw error;
    }
  },
};
