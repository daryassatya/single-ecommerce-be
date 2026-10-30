import { supabase } from '@/lib/supabase';
import { SocialMediaLink, SocialMediaLinkInput } from '@/types/database';

export const socialLinksService = {
  async getAll(): Promise<SocialMediaLink[]> {
    const { data, error } = await supabase
      .from('social_media_links')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching social media links:', error);
      throw error;
    }
    return data || [];
  },

  async create(input: SocialMediaLinkInput): Promise<SocialMediaLink> {
    const { data, error } = await supabase
      .from('social_media_links')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating social media link:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, input: Partial<SocialMediaLinkInput>): Promise<SocialMediaLink> {
    const { data, error } = await supabase
      .from('social_media_links')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating social media link ${id}:`, error);
      throw error;
    }
    return data;
  },

  async toggleActive(id: string, currentStatus: boolean): Promise<SocialMediaLink> {
    return this.update(id, { is_active: !currentStatus });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('social_media_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting social media link ${id}:`, error);
      throw error;
    }
  },

  async updateOrder(links: { id: string; sort_order: number }[]): Promise<void> {
    for (const link of links) {
      await supabase
        .from('social_media_links')
        .update({ sort_order: link.sort_order })
        .eq('id', link.id);
    }
  },
};
