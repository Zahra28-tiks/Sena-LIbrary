import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { loginMember, registerMember } from '../api/client.ts';
import { PublicUser } from '../types/library.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: PublicUser) => void;
}

export function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferLargeText, setPreferLargeText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginMember({ email, password });
        onSuccess(res.user);
      } else {
        const res = await registerMember({
          name,
          email,
          password,
          accessibilityPrefs: preferLargeText
            ? { fontSize: 22, lineHeight: 2.0, fontFamily: 'sans' }
            : undefined,
        });
        onSuccess(res.user);
      }
      setName('');
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2B22]/45 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#DFDDD2] bg-[#FBF9F4] p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-modal-title" className="font-editorial text-2xl font-semibold text-[#1A2B22]">
              {mode === 'login' ? 'Masuk ke SENA LIBRARY' : 'Daftar Anggota Baru'}
            </h2>
            <p className="mt-1 text-sm text-[#4A5D52]">
              {mode === 'login'
                ? 'Akses daftar favorit, peminjaman buku, dan riwayat baca Anda.'
                : 'Gratis dan terbuka untuk pelajar, mahasiswa, keluarga, dan pembaca umum.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela masuk"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#4A5D52] hover:bg-[#EDF1EC] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-[#EDEAE0] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`rounded-md py-2 text-sm font-medium transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[#FBF9F4] text-[#1A2B22] shadow-xs'
                : 'text-[#4A5D52] hover:text-[#1A2B22]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`rounded-md py-2 text-sm font-medium transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-[#FBF9F4] text-[#1A2B22] shadow-xs'
                : 'text-[#4A5D52] hover:text-[#1A2B22]'
            }`}
          >
            Daftar Anggota
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-[#D8B4B4] bg-[#FBF2F2] px-3.5 py-2.5 text-sm text-[#7F2D2D]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-[#1A2B22]">
                Nama Lengkap
              </label>
              <input
                id="auth-name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sari Kusuma"
                className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm text-[#1A2B22] focus:border-[#214232] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-[#1A2B22]">
              Alamat Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm text-[#1A2B22] focus:border-[#214232] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-[#1A2B22]">
              Kata Sandi
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm text-[#1A2B22] focus:border-[#214232] focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-3 rounded-lg border border-[#DFDDD2] bg-[#F0ECE1]/60 p-3 text-sm text-[#3D5245] cursor-pointer">
              <input
                type="checkbox"
                checked={preferLargeText}
                onChange={(e) => setPreferLargeText(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#8AA38D] accent-[#214232]"
              />
              <span>
                Aktifkan mode nyaman sejak awal (huruf besar 22px, jarak baris lega, gaya huruf
                ramah disleksia).
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#214232] py-3 text-sm font-medium text-[#FBF9F4] transition-colors hover:bg-[#183326] disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? 'Memproses...'
              : mode === 'login'
              ? 'Masuk ke Akun'
              : 'Buat Akun Anggota'}
          </button>
        </form>
      </div>
    </div>
  );
}
