import { supabase } from '@/lib/supabase';
import { Product, ProductInput, ProductVariantType } from '@/types/database';
import { enforceReadOnly } from '@/lib/displayMode';

function normalizeProduct(p: any): Product {
  const rawVariantTypes = p.product_variant_types || p.variant_types || [];
  const variantTypes: ProductVariantType[] = rawVariantTypes
    .map((vt: any) => ({
      id: vt.id,
      product_id: vt.product_id,
      name: vt.name,
      sort_order: vt.sort_order ?? 0,
      created_at: vt.created_at,
      options: (vt.product_variant_options || vt.options || [])
        .map((opt: any) => ({
          id: opt.id,
          variant_type_id: opt.variant_type_id,
          label: opt.label,
          price: Number(opt.price || 0),
          is_available: opt.is_available ?? true,
          sort_order: opt.sort_order ?? 0,
          created_at: opt.created_at,
        }))
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }))
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const hasVariants = p.has_variants === true || variantTypes.length > 0;
  const basePrice = hasVariants ? (p.base_price ?? null) : Number(p.base_price ?? p.price ?? 0);

  return {
    ...p,
    price: Number(p.price || 0),
    base_price: basePrice,
    has_variants: hasVariants,
    variants: Array.isArray(p.variants) ? p.variants : [],
    product_variant_types: variantTypes,
    variant_types: variantTypes,
  };
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    // Try fetching with nested variant types & options
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        ),
        product_variant_types (
          id,
          name,
          sort_order,
          product_variant_options (
            id,
            label,
            price,
            is_available,
            sort_order
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet in Supabase schema cache, fallback to simple query
      console.warn('Fallback query without nested variant tables:', error.message);
      const fallback = await supabase
        .from('products')
        .select(`
          *,
          product_types (
            id,
            name,
            slug,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (fallback.error) {
        console.error('Error fetching products:', fallback.error);
        throw fallback.error;
      }
      return (fallback.data || []).map(normalizeProduct);
    }

    return (data || []).map(normalizeProduct);
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        ),
        product_variant_types (
          id,
          name,
          sort_order,
          product_variant_options (
            id,
            label,
            price,
            is_available,
            sort_order
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      // Fallback if nested tables aren't present
      const fallback = await supabase
        .from('products')
        .select(`
          *,
          product_types (
            id,
            name,
            slug,
            is_active
          )
        `)
        .eq('id', id)
        .single();

      if (fallback.error) {
        console.error(`Error fetching product ${id}:`, fallback.error);
        throw fallback.error;
      }
      return fallback.data ? normalizeProduct(fallback.data) : null;
    }

    return data ? normalizeProduct(data) : null;
  },

  async create(input: ProductInput): Promise<Product> {
    enforceReadOnly('Menambah produk');
    const { variant_types, ...coreInput } = input;

    // Determine base_price and price
    const hasVariants = Boolean(coreInput.has_variants);
    const basePrice = hasVariants ? null : Number(coreInput.base_price ?? coreInput.price ?? 0);

    // Calculate a display price if has_variants is true (from cheapest option if available)
    let displayPrice = Number(coreInput.price || 0);
    if (hasVariants && variant_types && variant_types.length > 0) {
      const allOptionPrices: number[] = [];
      variant_types.forEach((vt) => {
        vt.options.forEach((opt) => allOptionPrices.push(Number(opt.price)));
      });
      if (allOptionPrices.length > 0) {
        displayPrice = Math.min(...allOptionPrices);
      }
    }

    // Auto-populate legacy variants array for storefront fallback
    const legacyVariants = hasVariants && variant_types && variant_types.length > 0
      ? variant_types.map((vt) => vt.name)
      : (coreInput.variants || []);

    const productPayload: Record<string, any> = {
      name: coreInput.name,
      type_id: coreInput.type_id,
      price: displayPrice,
      base_price: basePrice,
      has_variants: hasVariants,
      badge: coreInput.badge,
      icon_name: coreInput.icon_name,
      variants: legacyVariants,
      description: coreInput.description,
      is_active: coreInput.is_active,
    };

    const { data: createdProduct, error } = await supabase
      .from('products')
      .insert([productPayload])
      .select(`
        *,
        product_types (
          id,
          name,
          slug,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    // If product has variants, insert Level 1 types and Level 2 options
    if (hasVariants && variant_types && variant_types.length > 0) {
      try {
        for (let i = 0; i < variant_types.length; i++) {
          const vt = variant_types[i];
          const { data: createdType, error: typeErr } = await supabase
            .from('product_variant_types')
            .insert({
              product_id: createdProduct.id,
              name: vt.name,
              sort_order: vt.sort_order ?? i + 1,
            })
            .select()
            .single();

          if (typeErr) {
            console.error('Error creating variant type:', typeErr);
            continue;
          }

          if (vt.options && vt.options.length > 0) {
            const optionsPayload = vt.options.map((opt, optIdx) => ({
              variant_type_id: createdType.id,
              label: opt.label,
              price: Number(opt.price),
              is_available: opt.is_available ?? true,
              sort_order: opt.sort_order ?? optIdx + 1,
            }));

            const { error: optErr } = await supabase
              .from('product_variant_options')
              .insert(optionsPayload);

            if (optErr) {
              console.error('Error creating variant options:', optErr);
            }
          }
        }
      } catch (err) {
        console.warn('Error inserting nested variants:', err);
      }
    }

    // Return complete product with relations
    return (await this.getById(createdProduct.id)) || normalizeProduct(createdProduct);
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    enforceReadOnly('Mengubah produk');
    const { variant_types, ...coreInput } = input;

    const hasVariants = coreInput.has_variants !== undefined 
      ? Boolean(coreInput.has_variants)
      : undefined;

    const updatePayload: Record<string, any> = { ...coreInput };

    if (hasVariants !== undefined) {
      updatePayload.has_variants = hasVariants;
      if (hasVariants) {
        updatePayload.base_price = null;
      } else if (coreInput.base_price !== undefined || coreInput.price !== undefined) {
        updatePayload.base_price = Number(coreInput.base_price ?? coreInput.price ?? 0);
      }
    }

    if (variant_types && variant_types.length > 0) {
      // Auto-compute display price and legacy variants
      const allOptionPrices: number[] = [];
      variant_types.forEach((vt) => {
        vt.options.forEach((opt) => allOptionPrices.push(Number(opt.price)));
      });
      if (allOptionPrices.length > 0) {
        updatePayload.price = Math.min(...allOptionPrices);
      }
      updatePayload.variants = variant_types.map((vt) => vt.name);
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (updateErr) {
      console.error(`Error updating product ${id}:`, updateErr);
      throw updateErr;
    }

    // If variant_types was explicitly provided in update
    if (variant_types !== undefined) {
      try {
        // Delete previous variant types (cascade will automatically delete options)
        await supabase
          .from('product_variant_types')
          .delete()
          .eq('product_id', id);

        // Re-insert if hasVariants is true
        if (hasVariants !== false && variant_types.length > 0) {
          for (let i = 0; i < variant_types.length; i++) {
            const vt = variant_types[i];
            const { data: createdType, error: typeErr } = await supabase
              .from('product_variant_types')
              .insert({
                product_id: id,
                name: vt.name,
                sort_order: vt.sort_order ?? i + 1,
              })
              .select()
              .single();

            if (typeErr) {
              console.error('Error re-inserting variant type:', typeErr);
              continue;
            }

            if (vt.options && vt.options.length > 0) {
              const optionsPayload = vt.options.map((opt, optIdx) => ({
                variant_type_id: createdType.id,
                label: opt.label,
                price: Number(opt.price),
                is_available: opt.is_available ?? true,
                sort_order: opt.sort_order ?? optIdx + 1,
              }));

              const { error: optErr } = await supabase
                .from('product_variant_options')
                .insert(optionsPayload);

              if (optErr) {
                console.error('Error re-inserting variant options:', optErr);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error syncing nested variants during update:', err);
      }
    }

    // Return complete updated product
    return (await this.getById(id)) || (await this.getAll()).find((p) => p.id === id)!;
  },

  async toggleActive(id: string, currentStatus: boolean): Promise<Product> {
    return this.update(id, { is_active: !currentStatus });
  },

  async delete(id: string): Promise<void> {
    enforceReadOnly('Menghapus produk');
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};
