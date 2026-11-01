-- ==============================================================================
-- CONTOH NAMA TOKO - DATABASE REBRANDING & SYNC MIGRATION (V10)
-- SINKRONISASI IDENTITAS DISPLAY DASHBOARD DENGAN FRONTEND DISPLAY
-- ==============================================================================

-- 1. SINKRONKAN PROFIL TOKO KE "Contoh Nama Toko"
UPDATE store_profile
SET 
  store_name = 'Contoh Nama Toko',
  handle = '@oepalin',
  badge_text = 'DIGITAL GOODIES & SOCIAL HUB',
  bio = 'Tempat paling nyaman buat langganan aplikasi premium & digital goodies dengan garansi penuh dan proses kilat 5–30 menit.',
  announcement_text = 'Katalog Baru! Beragam Aplikasi Premium siap diorder via WhatsApp Order bit.ly/wa-ciaa ✨',
  marquee_messages = ARRAY[
    'check product details before ordering 🛍️',
    'made with love & pixel magic by Contoh Nama Toko 💜',
    'QRIS All E-Wallet & All Bank Ready 💳',
    'WhatsApp Order: bit.ly/wa-ciaa ✨'
  ],
  updated_at = NOW()
WHERE id IS NOT NULL;

-- 2. SINKRONKAN TEMPLATE PESAN TRANSAKSI ORDER
UPDATE customer_message_settings
SET 
  message_template = E'Halo Admin! ✨\nSaya ingin memesan produk berikut:\n\n🛍️ Produk: {nama_produk}\n📂 Kategori: {tipe_produk}\n💰 Harga: {harga}\n📝 Keterangan: {deskripsi}\n\nMohon bantu proses pesanan saya ya. Terima kasih! 🩵',
  updated_at = NOW()
WHERE setting_key = 'default_order_message';

-- 3. TAMBAHKAN / PASTIKAN AKUN ADMIN DEMO RESMI TERSEDIA
INSERT INTO admin_accounts (email, password, name, role)
VALUES 
  ('admin@daryas.tech', '@demo123', 'Admin Demo', 'Super Admin')
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  updated_at = NOW();
