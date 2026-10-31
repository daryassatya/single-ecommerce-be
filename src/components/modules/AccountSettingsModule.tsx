import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { SEEDED_ADMINS } from '@/services/adminAccountsService';

export function AccountSettingsModule() {
  const { user, updateCredentials } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.name || 'Cia');
  const [email, setEmail] = useState(user?.email || 'prabandarisyafira@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast({
        title: 'Password Saat Ini Wajib Diisi',
        description: 'Masukkan password lama/saat ini untuk memvalidasi perubahan akun.',
        variant: 'error',
      });
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        toast({
          title: 'Password Terlalu Pendek',
          description: 'Password baru minimal harus terdiri dari 6 karakter.',
          variant: 'error',
        });
        return;
      }

      if (newPassword.trim() !== confirmPassword.trim()) {
        toast({
          title: 'Konfirmasi Password Tidak Cocok',
          description: 'Password baru dan konfirmasi password harus sama persis.',
          variant: 'error',
        });
        return;
      }
    }

    try {
      setSaving(true);
      const res = await updateCredentials({
        currentEmail: user?.email || email,
        currentPassword: currentPassword.trim(),
        newEmail: email.trim().toLowerCase(),
        newPassword: newPassword.trim() ? newPassword.trim() : undefined,
        newName: fullName.trim(),
      });

      if (res.success) {
        toast({
          title: 'Kredensial Akun Berhasil Diperbarui',
          description: 'Email, profil, dan/atau password admin berhasil disimpan.',
          variant: 'success',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Gagal Memperbarui Akun',
          description: res.error || 'Terjadi kesalahan saat memproses data.',
          variant: 'error',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui akun';
      toast({
        title: 'Terjadi Kesalahan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/60 shadow-2xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pengaturan Akun Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Kelola profil, ubah alamat email, dan perbarui kata sandi keamanan dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current User Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm text-center">
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-brand-500/20 ring-4 ring-brand-50">
              {(user?.name || 'Admin')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <h3 className="mt-4 font-bold text-base text-slate-900">{user?.name || 'Admin'}</h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{user?.email}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-xs font-semibold text-brand-700">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>{user?.role || 'Super Admin'}</span>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-left space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hak Akses:</span>
                <span className="font-semibold text-slate-800">Full Access (Root)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Sesi:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Autentikasi:</span>
                <span className="font-semibold text-slate-800">Supabase & Local RLS</span>
              </div>
            </div>
          </div>

          {/* Seeded Admins Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Daftar Akun Admin Sistem</span>
            </h4>
            <div className="space-y-2">
              {SEEDED_ADMINS.map((adm, i) => {
                const isCurrent = user?.email.toLowerCase() === adm.email.toLowerCase();
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-xs transition-colors ${
                      isCurrent
                        ? 'border-brand-300 bg-brand-50/60'
                        : 'border-slate-200/70 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{adm.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-brand-600 text-white font-semibold px-2 py-0.5 rounded-full">
                          Akun Anda
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{adm.email}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Update Credentials Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-600" />
                <span>Ubah Profil & Kata Sandi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Silakan perbarui nama, email, atau password. Password saat ini wajib dimasukkan untuk otorisasi keamanan.
              </p>
            </div>

            {/* Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Lengkap Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="Nama lengkap admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat Email Admin
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="Alamat email admin"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              {/* Password Saat Ini (Required) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password Saat Ini (Wajib) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="Masukkan password saat ini untuk konfirmasi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Diperlukan untuk memvalidasi bahwa Anda adalah pemilik akun yang sah.
                </p>
              </div>

              {/* Password Baru & Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Password Baru (Opsional)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="Kosongkan jika tidak diubah (min 6 char)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="Ketik ulang password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 text-xs text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Catatan Keamanan Akun:</p>
                <p className="mt-0.5 text-amber-700">
                  Perubahan kredensial akan langsung disimpan secara persisten ke database & sesi lokal. Simpan password baru Anda di tempat yang aman.
                </p>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" disabled={saving} className="gap-2 px-6">
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Akun'}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
