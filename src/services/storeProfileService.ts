import { supabase } from '@/lib/supabase';
import { StoreProfile, StoreProfileInput } from '@/types/database';

export const storeProfileService = {
  async get(): Promise<StoreProfile | null> {
    const { data, error } = await supabase
      .from('store_profile')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching store profile:', error);
      throw error;
    }
    return data;
  },

  async update(input: Partial<StoreProfileInput>): Promise<StoreProfile> {
    const current = await this.get();

    if (current) {
      const { data, error } = await supabase
        .from('store_profile')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating store profile:', error);
        throw error;
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from('store_profile')
        .insert([{
          ...input,
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting store profile:', error);
        throw error;
      }
      return data;
    }
  },
};
