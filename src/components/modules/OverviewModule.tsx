import { useState, useEffect } from 'react';
import { productsService } from '@/services/productsService';
import { productTypesService } from '@/services/productTypesService';
import { socialLinksService } from '@/services/socialLinksService';
import { testimonialsService } from '@/services/testimonialsService';
import { heroSlidesService } from '@/services/heroSlidesService';
import { termsService } from '@/services/termsService';
import { Product, ProductType, SocialMediaLink, Testimonial, HeroSlide, TermsAndCondition } from '@/types/database';
import { DynamicIcon } from '@/lib/icons';
import { formatRupiah } from '@/lib/utils';
import {
  Package,
  Layers,
  Share2,
  ArrowUpRight,
  Sparkles,
  Database,
  Heart,
  FileText,
  Terminal,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface OverviewModuleProps {
  onNavigate: (tab: NavTab) => void;
}

export function OverviewModule({ onNavigate }: OverviewModuleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [socials, setSocials] = useState<SocialMediaLink[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [terms, setTerms] = useState<TermsAndCondition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [prodsData, typesData, socialsData, testiData, slidesData, termsData] =
          await Promise.all([
            productsService.getAll().catch(() => []),
            productTypesService.getAll().catch(() => []),
            socialLinksService.getAll().catch(() => []),
            testimonialsService.getAll().catch(() => []),
            heroSlidesService.getAll().catch(() => []),
            termsService.getAll().catch(() => []),
          ]);
        setProducts(prodsData);
        setTypes(typesData);
        setSocials(socialsData);
        setTestimonials(testiData);
        setSlides(slidesData);
        setTerms(termsData);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const activeProducts = products.filter((p) => p.is_active);
  const activeTypes = types.filter((t) => t.is_active);
  const activeSocials = socials.filter((s) => s.is_active);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3 text-sky-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Contoh Nama Toko Admin Dashboard & CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Admin Dashboard CMS! ✦˚𝜗𝜚.ᐟ
          </h1>
          <p className="mt-2 text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Kelola katalog produk berbasis ikon Lucide, tipe kategori, ulasan, hero banner, pesan otomatis, serta profil toko yang tersinkronisasi langsung dengan frontend display.
          </p>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-8 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-sky-300/20 blur-xl pointer-events-none" />
      </div>

      {/* Database Schema Guide Banner */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Setup Skema Database Supabase
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Script SQL lengkap untuk membuat tabel, RLS policies, dan initial seed data tersedia di file{' '}
                <code className="rounded bg-sky-100/80 px-1.5 py-0.5 font-mono text-sky-900 font-semibold">
                  supabase/schema.sql
                </code>
                . Cukup copy & paste ke <strong>Supabase SQL Editor</strong> untuk inisialisasi instan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Produk */}
        <div
          onClick={() => onNavigate('products')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Produk</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : products.length}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-600">{activeProducts.length} aktif</span>
              <span>· Katalog Shop</span>
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Tipe / Kategori */}
        <div
          onClick={() => onNavigate('types')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kategori Produk</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : types.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">{activeTypes.length} aktif</span> di filter etalase
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Testimoni Pembeli */}
        <div
          onClick={() => onNavigate('testimonials')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Testimoni Pembeli</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : testimonials.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">
                {testimonials.filter((t) => t.is_approved).length} disetujui
              </span>{' '}
              · Sweet Stories
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Hero Slides */}
        <div
          onClick={() => onNavigate('hero')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hero Carousel</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : slides.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">
                {slides.filter((s) => s.is_active).length} slide tayang
              </span>{' '}
              di beranda
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Syarat & Ketentuan */}
        <div
          onClick={() => onNavigate('terms')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Syarat &amp; Ketentuan</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : terms.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">
                {terms.filter((t) => t.is_active).length} aturan aktif
              </span>{' '}
              (Apps, Robux, MLBB)
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Social Media Links */}
        <div
          onClick={() => onNavigate('social')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Social &amp; Quick Links</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '-' : socials.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">{activeSocials.length} link aktif</span>
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      {/* Recent Products with Lucide Icons Preview */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Katalog Produk Terkini</h2>
            <p className="text-xs text-slate-500">
              Daftar produk yang aktif di etalase toko menggunakan ikon Lucide.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            Lihat Semua Produk
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 border border-slate-200/80 shadow-2xs">
                <DynamicIcon name={prod.icon_name || 'Package'} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-slate-900 truncate">{prod.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-semibold text-brand-700">
                    {formatRupiah(prod.price)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {prod.icon_name}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && !loading && (
            <div className="col-span-full py-8 text-center text-sm text-slate-400">
              Belum ada produk. Jalankan seed SQL di Supabase atau klik Tambah Produk.
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack Info */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-brand-400" />
          Tech Stack & Deployment Specs
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Framework</span>
            <span className="font-semibold text-slate-200">Vite + React (TS)</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Database</span>
            <span className="font-semibold text-slate-200">Supabase (PostgreSQL)</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">UI Primitives</span>
            <span className="font-semibold text-slate-200">Radix UI + Tailwind</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Hosting Target</span>
            <span className="font-semibold text-slate-200">Vercel (SPA Rewrites)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
