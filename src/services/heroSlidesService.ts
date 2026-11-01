import { supabase } from '@/lib/supabase';
import { HeroSlide, HeroSlideInput } from '@/types/database';
import { enforceReadOnly } from '@/lib/displayMode';

export const heroSlidesService = {
  async getAll(): Promise<HeroSlide[]> {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(5); // Maksimal 5 slide

    if (error) {
      console.error('Error fetching hero slides:', error);
      throw error;
    }
    return data || [];
  },

  async uploadImage(file: File): Promise<string> {
    enforceReadOnly('Mengunggah gambar slide');
    // 1. Pengecekan tipe file: Hanya boleh bertipe gambar
    if (!file.type.startsWith('image/')) {
      throw new Error('Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan.');
    }

    // 2. Pengecekan ukuran file: Maksimal 5MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Ukuran file terlalu besar! Maksimal ukuran gambar adalah 5MB.');
    }

    // Buat nama file unik
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const fileName = `hero_${Date.now()}_${cleanName}.${ext}`;

    try {
      // Coba upload ke Supabase Storage bucket 'hero-slides'
      const { data, error } = await supabase.storage
        .from('hero-slides')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('hero-slides')
          .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Storage upload warning, fallback to base64:', storageErr);
    }

    // Fallback konversi ke Base64 data URL
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      reader.readAsDataURL(file);
    });
  },

  async create(input: HeroSlideInput): Promise<HeroSlide> {
    enforceReadOnly('Menambah slide hero');
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{
        badge: input.badge.trim(),
        title: input.title.trim(),
        description: input.description.trim(),
        sort_order: Number(input.sort_order) || 0,
        is_active: input.is_active ?? true,
        image_url: input.image_url ? input.image_url.trim() : null,
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
    enforceReadOnly('Mengubah slide hero');
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
    enforceReadOnly('Menghapus slide hero');
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
