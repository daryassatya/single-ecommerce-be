# Single Page E-Commerce — Admin Dashboard & CMS (Display Demo) ✦˚𝜗𝜚.ᐟ

> **Display / Demo Admin Dashboard & CMS Single Page E-Commerce**  
> Dibuat oleh [daryas.tech](https://daryas.tech/)

Aplikasi Admin Dashboard & Content Management System (CMS) modern untuk display produk **Single Page E-Commerce** (menggunakan identitas demo **Contoh Nama Toko**). Dibangun dengan **Vite + React (TypeScript)**, dipadukan dengan **Radix UI Primitives**, **Tailwind CSS**, dan **Lucide Icons**, serta terintegrasi penuh ke database PostgreSQL **Supabase** dan siap dideploy ke **Vercel (Vercel-Ready SPA)**.

---

## Fitur Utama

1. **CRUD Tipe Produk (Kategori)**:
   - Tambah, lihat, ubah, dan hapus tipe/kategori produk.
   - Kolom: `id`, `name`, `slug`, `description`, `is_active`, `created_at`.
   - Menggunakan Radix UI `Dialog`, `AlertDialog` (konfirmasi hapus), dan `Switch` untuk status aktif.

2. **CRUD Produk (Berbasis Lucide Icons, Tanpa Upload Gambar)**:
   - Manajemen produk yang berelasi dengan Tipe Produk (Foreign Key).
   - **Interactive Lucide Icon Picker**: Memilih dari 50+ ikon populer secara live via Radix UI `Popover` dengan pencarian real-time dan preview dinamis.
   - Kolom: `id`, `type_id`, `name`, `price`, `badge`, `icon_name`, `variants`, `description`, `is_active`.
   - Dropdown relasi kategori menggunakan Radix UI `Select`.

3. **Pengaturan Pesan & Deskripsi Customer**:
   - CMS untuk mengelola template pesan transaksi otomatis customer.
   - Dukungan token variabel dinamis: `{nama_produk}`, `{tipe_produk}`, `{harga}`, `{deskripsi}`.
   - Tombol variable chips yang otomatis menyisipkan variabel ke posisi kursor textarea.
   - **Live Interactive WhatsApp Simulation**: Tampilan simulasi balon chat WhatsApp real-time saat customer memilih produk.

4. **Pengaturan Social Media Links**:
   - CRUD tautan media sosial toko (WhatsApp, Discord, Telegram, X, dll).
   - Kolom: `platform`, `title`, `url`, `icon_name`, `sort_order`, `is_active`.
   - Ikon Lucide interaktif dan toggle status aktif.

5. **Standar UI/UX & Radix UI Primitives**:
   - `@radix-ui/react-dialog` & `@radix-ui/react-alert-dialog` untuk modal form dan konfirmasi hapus.
   - `@radix-ui/react-popover` untuk komponen Icon Picker.
   - `@radix-ui/react-select` untuk memilih kategori produk.
   - `@radix-ui/react-switch` untuk toggle status aktif/nonaktif.
   - `@radix-ui/react-tabs` untuk tab navigasi modul pengaturan CMS.
   - `@radix-ui/react-toast` untuk notifikasi umpan balik sukses/gagal di seluruh aksi CRUD.

---

## Keamanan Kredensial (.env)

Proyek mematuhi aturan keamanan ketat tanpa hardcoded credentials atau fallback:

- File `.env` (masuk ke `.gitignore`):
  ```env
  VITE_SUPABASE_URL=https://qbwqixbfkwdmfcungqom.supabase.co
  VITE_SUPABASE_ANON_KEY=sb_publishable_7m1y95HFH3U6WVT7yX_4iQ_kVu6-bhG
  ```

- File `.env.example`:
  ```env
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  ```

Client Supabase (`src/lib/supabase.ts`) memeriksa ketersediaan variabel environment saat inisialisasi dan melempar error deskriptif jika belum diset.

---

## Setup Database Supabase (`supabase/schema.sql`)

1. Buka dashboard proyek Anda di [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor**.
3. Buat query baru, lalu salin dan jalankan seluruh isi file `supabase/schema.sql`.
4. Script ini otomatis:
   - Membuat tabel `product_types`, `products`, `customer_message_settings`, dan `social_media_links`.
   - Membuat trigger auto-update untuk timestamp `updated_at`.
   - Mengaktifkan Row Level Security (RLS) dengan kebijakan yang aman.
   - Memasukkan data awal (initial seed data) produk dan tautan Contoh Nama Toko.

---

## Menjalankan Secara Lokal

```bash
# Masuk ke folder proyek
cd single-ecommerce-be

# Pastikan dependencies terinstall
npm install

# Jalankan development server
npm run dev
```

Aplikasi dapat diakses di browser melalui `http://localhost:5173`.

---

## Panduan Deployment ke Vercel (Vercel-Ready)

Proyek ini telah dilengkapi file `vercel.json` dengan konfigurasi routing SPA:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "cleanUrls": true
}
```

### Langkah Deploy di Vercel:

1. Push repository ke GitHub/GitLab.
2. Di Vercel Dashboard, klik **Add New Project** dan import repository ini.
3. Pada bagian **Root Directory**, biarkan `./` (atau pilih folder `single-ecommerce-be` jika di monorepo).
4. **Framework Preset**: Vite (otomatis terdeteksi).
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Pada bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - `VITE_SUPABASE_URL`: `https://qbwqixbfkwdmfcungqom.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_7m1y95HFH3U6WVT7yX_4iQ_kVu6-bhG`
6. Klik **Deploy**. Vercel akan mem-build dan mendeploy aplikasi secara otomatis tanpa error.
