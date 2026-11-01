import { supabase } from '@/lib/supabase';
import { CustomerMessageSetting } from '@/types/database';
import { enforceReadOnly } from '@/lib/displayMode';

export const messageSettingsService = {
  async get(settingKey: string = 'default_order_message'): Promise<CustomerMessageSetting | null> {
    const { data, error } = await supabase
      .from('customer_message_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching customer message setting (${settingKey}):`, error);
      throw error;
    }
    return data;
  },

  async update(
    settingKey: string,
    payload: { title?: string; description?: string; message_template: string }
  ): Promise<CustomerMessageSetting> {
    enforceReadOnly('Menyimpan template pesan WhatsApp');
    // Check if exists first
    const existing = await this.get(settingKey);

    if (existing) {
      const { data, error } = await supabase
        .from('customer_message_settings')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer message setting:', error);
        throw error;
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from('customer_message_settings')
        .insert([
          {
            setting_key: settingKey,
            title: payload.title || 'Template Pesan Order WhatsApp',
            description: payload.description || 'Template pesan order customer',
            message_template: payload.message_template,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting customer message setting:', error);
        throw error;
      }
      return data;
    }
  },
};
