import { supabase } from '@/lib/supabase';
import { StoreProfile, StoreProfileInput } from '@/types/database';

export const storeProfileService = {
  async uploadAvatar(file: File): Promise<string> {
    // 1. Validasi tipe file
    if (!file.type.startsWith('image/')) {
      throw new Error('Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan.');
    }

    // 2. Validasi ukuran file (Maksimal 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Ukuran file terlalu besar! Maksimal ukuran gambar adalah 5MB.');
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15);
    const fileName = `avatar_${Date.now()}_${cleanName}.${ext}`;

    try {
      // Coba upload ke Supabase Storage bucket 'store-assets' atau 'hero-slides'
      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Storage upload error, falling back to base64:', storageErr);
    }

    // Fallback konversi ke Base64 data URL
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      reader.readAsDataURL(file);
    });
  },

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
