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
import { Button } from '@/components/ui/Button';
import {
  Package,
  Layers,
  Share2,
  ArrowUpRight,
  Sparkles,
  Heart,
  FileText,
  LayoutDashboard,
  RefreshCw,
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

  const loadStats = async () => {
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
  };

  useEffect(() => {
    loadStats();
  }, []);

  const activeProducts = products.filter((p) => p.is_active);
  const activeTypes = types.filter((t) => t.is_active);
  const activeSocials = socials.filter((s) => s.is_active);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-brand-600" />
            <span>Ringkasan &amp; Metrik Toko</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan statistik katalog produk, kategori, ulasan pembeli, dan status display etalase toko.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={loading}
            title="Refresh Data"
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
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
    </div>
  );
}
