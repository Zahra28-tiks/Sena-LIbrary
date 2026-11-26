import { useCallback, useEffect, useState } from 'react';
import { Edit2, Plus, RotateCcw, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import {
  claimInitialAdmin,
  createLibraryBook,
  deleteLibraryBook,
  fetchAdminBootstrapStatus,
  fetchAdminOverview,
  loginAdminWithPasscode,
  loginMember,
  returnLibraryLoan,
  updateLibraryBook,
  updateMemberStatus,
} from '../api/client.ts';
import {
  AccessibilityFeature,
  AdminOverviewResponse,
  Book,
  BookCategory,
  PublicUser,
} from '../types/library.ts';

interface AdminViewProps {
  currentUser: PublicUser | null;
  books: Book[];
  onAdminAuthenticated: (user: PublicUser) => void;
  onBooksChanged: () => void;
  onNotify: (message: string) => void;
}

const CATEGORIES: BookCategory[] = [
  'Sastra & Fiksi',
  'Sains & Ekologi',
  'Sejarah & Budaya',
  'Pendidikan & Inklusi',
  'Pengembangan Diri',
  'Cerita Anak & Remaja',
];

const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  'Ramah Disleksia',
  'Teks Besar',
  'Struktur Bab Jelas',
  'Ringkasan Suara',
];

const COVER_PRESETS = [
  {
    label: 'Lanskap Aksara (Krem & Sage)',
    url: '/src/assets/images/cover_jejak_aksara_1795659418063.jpg',
    tone: 'cream-sage' as const,
  },
  {
    label: 'Botani Nusantara (Hijau Daun)',
    url: '/src/assets/images/cover_ekologi_nusantara_1795659417907.jpg',
    tone: 'sand-botanical' as const,
  },
  {
    label: 'Arsitektur Cahaya (Batu & Sage)',
    url: '/src/assets/images/cover_arsitektur_cahaya_1795659419135.jpg',
    tone: 'mist-editorial' as const,
  },
  {
    label: 'Ruang Inklusi (Geometri Organik)',
    url: '/src/assets/images/cover_ruang_inklusi_1795659417871.jpg',
    tone: 'forest-linen' as const,
  },
];

interface BookFormState {
  title: string;
  author: string;
  category: BookCategory;
  year: number;
  isbn: string;
  publisher: string;
  pages: number;
  totalCopies: number;
  coverUrl: string;
  coverTone: Book['coverTone'];
  accessibilityFeatures: AccessibilityFeature[];
  synopsis: string;
  featured: boolean;
  chapterTitle: string;
  chapterBody: string;
}

const EMPTY_FORM: BookFormState = {
  title: '',
  author: '',
  category: 'Pendidikan & Inklusi',
  year: 2026,
  isbn: '',
  publisher: 'Pustaka Sena',
  pages: 180,
  totalCopies: 4,
  coverUrl: COVER_PRESETS[0].url,
  coverTone: 'cream-sage',
  accessibilityFeatures: ['Teks Besar', 'Struktur Bab Jelas'],
  synopsis: '',
  featured: false,
  chapterTitle: 'Bab 1: Pengantar',
  chapterBody: '',
};

export function AdminView({
  currentUser,
  books,
  onAdminAuthenticated,
  onBooksChanged,
  onNotify,
}: AdminViewProps) {
  const [bootstrap, setBootstrap] = useState<{
    envPasscodeConfigured: boolean;
    adminClaimed: boolean;
    needsInitialClaim: boolean;
  } | null>(null);

  // Admin auth state
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'books' | 'members' | 'loans'>('books');
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Book Modal state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState<BookFormState>(EMPTY_FORM);
  const [bookFormError, setBookFormError] = useState('');
  const [bookSaving, setBookSaving] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const loadBootstrap = useCallback(async () => {
    try {
      const status = await fetchAdminBootstrapStatus();
      setBootstrap(status);
    } catch {
      // ignore
    }
  }, []);

  const loadOverview = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingOverview(true);
    try {
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal memuat data admin.');
    } finally {
      setLoadingOverview(false);
    }
  }, [isAdmin, onNotify]);

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    if (isAdmin) {
      loadOverview();
    }
  }, [isAdmin, loadOverview]);

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await claimInitialAdmin({
        name: authName,
        email: authEmail,
        password: authPassword,
      });
      onAdminAuthenticated(res.user);
      await loadBootstrap();
      onNotify('Akun administrator pertama berhasil diaktifkan.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal mengaktifkan akun admin.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginMember({ email: authEmail, password: authPassword });
      if (res.user.role !== 'admin') {
        setAuthError('Akun ini terdaftar sebagai anggota biasa, bukan administrator.');
        return;
      }
      onAdminAuthenticated(res.user);
      onNotify('Berhasil masuk ke Dashboard Administrator.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal masuk sebagai administrator.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginAdminWithPasscode(passcodeInput);
      onAdminAuthenticated(res.user);
      setPasscodeInput('');
      onNotify('Berhasil masuk ke Dashboard Administrator.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Passcode tidak sesuai.');
    } finally {
      setAuthLoading(false);
    }
  };

  const openCreateBookModal = () => {
    setEditingBookId(null);
    setBookForm(EMPTY_FORM);
    setBookFormError('');
    setBookModalOpen(true);
  };

  const openEditBookModal = (book: Book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category,
      year: book.year,
      isbn: book.isbn,
      publisher: book.publisher,
      pages: book.pages,
      totalCopies: book.totalCopies,
      coverUrl: book.coverUrl,
      coverTone: book.coverTone,
      accessibilityFeatures: [...book.accessibilityFeatures],
      synopsis: book.synopsis,
      featured: book.featured,
      chapterTitle: book.chapters[0]?.title || 'Bab 1: Pengantar',
      chapterBody: book.chapters[0]?.paragraphs.join('\n\n') || '',
    });
    setBookFormError('');
    setBookModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookFormError('');
    setBookSaving(true);

    try {
      const paragraphs = bookForm.chapterBody
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (editingBookId) {
        await updateLibraryBook(editingBookId, {
          title: bookForm.title,
          author: bookForm.author,
          category: bookForm.category,
          year: Number(bookForm.year),
          isbn: bookForm.isbn,
          publisher: bookForm.publisher,
          pages: Number(bookForm.pages),
          totalCopies: Number(bookForm.totalCopies),
          coverUrl: bookForm.coverUrl,
          accessibilityFeatures: bookForm.accessibilityFeatures,
          synopsis: bookForm.synopsis,
          featured: bookForm.featured,
        });
        onNotify(`Koleksi "${bookForm.title}" berhasil diperbarui.`);
      } else {
        await createLibraryBook({
          title: bookForm.title,
          author: bookForm.author,
          category: bookForm.category,
          year: Number(bookForm.year),
          isbn: bookForm.isbn,
          publisher: bookForm.publisher,
          pages: Number(bookForm.pages),
          totalCopies: Number(bookForm.totalCopies),
          coverUrl: bookForm.coverUrl,
          coverTone: bookForm.coverTone,
          accessibilityFeatures: bookForm.accessibilityFeatures,
          synopsis: bookForm.synopsis,
          featured: bookForm.featured,
          chapters: [
            {
              id: 'ch-1',
              title: bookForm.chapterTitle || 'Bab 1: Pengantar',
              estimatedMinutes: 3,
              paragraphs:
                paragraphs.length > 0
                  ? paragraphs
                  : [bookForm.synopsis || 'Koleksi digital baru SENA LIBRARY.'],
            },
          ],
        });
        onNotify(`Buku "${bookForm.title}" berhasil ditambahkan ke katalog.`);
      }
      setBookModalOpen(false);
      onBooksChanged();
      await loadOverview();
    } catch (err) {
      setBookFormError(err instanceof Error ? err.message : 'Gagal menyimpan data buku.');
    } finally {
      setBookSaving(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteLibraryBook(bookId);
      setConfirmDeleteId(null);
      onBooksChanged();
      await loadOverview();
      onNotify('Buku berhasil dihapus dari katalog.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal menghapus buku.');
    }
  };

  const handleToggleMemberStatus = async (member: PublicUser) => {
    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      await updateMemberStatus(member.id, { status: nextStatus });
      await loadOverview();
      onNotify(
        `Status anggota ${member.name} diubah menjadi ${
          nextStatus === 'active' ? 'Aktif' : 'Ditangguhkan'
        }.`
      );
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal mengubah status anggota.');
    }
  };

  const handleToggleMemberRole = async (member: PublicUser) => {
    const nextRole = member.role === 'admin' ? 'member' : 'admin';
    try {
      await updateMemberStatus(member.id, { role: nextRole });
      await loadOverview();
      onNotify(
        `Peran ${member.name} diperbarui menjadi ${
          nextRole === 'admin' ? 'Administrator' : 'Anggota'
        }.`
      );
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal memperbarui peran anggota.');
    }
  };

  const handleAdminReturnLoan = async (loanId: string) => {
    try {
      await returnLibraryLoan(loanId);
      onBooksChanged();
      await loadOverview();
      onNotify('Pengembalian buku dicatat oleh administrator.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal mencatat pengembalian.');
    }
  };

  // --- Non-Admin Gate (First-Run Claim / Passcode / Admin Login) ---
  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[#DFDDD2] bg-[#FBF9F4] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-[#214232]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">Panel Pengelola SENA LIBRARY</span>
          </div>

          {bootstrap?.needsInitialClaim ? (
            <>
              <h1 className="mt-3 font-editorial text-2xl font-semibold text-[#1A2B22]">
                Aktivasi Administrator Pertama
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">
                Belum ada akun administrator yang terdaftar. Buat akun pengelola pertama Anda untuk
                mulai mengelola koleksi buku, anggota, dan peminjaman.
              </p>

              {authError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-[#D8B4B4] bg-[#FBF2F2] px-3.5 py-2.5 text-sm text-[#7F2D2D]"
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handleClaimAdmin} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="claim-name" className="block text-sm font-medium text-[#1A2B22]">
                    Nama Pengelola
                  </label>
                  <input
                    id="claim-name"
                    type="text"
                    required
                    minLength={2}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Nama lengkap administrator"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="claim-email" className="block text-sm font-medium text-[#1A2B22]">
                    Email Administrator
                  </label>
                  <input
                    id="claim-email"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="admin@senalibrary.id"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="claim-password"
                    className="block text-sm font-medium text-[#1A2B22]"
                  >
                    Kata Sandi
                  </label>
                  <input
                    id="claim-password"
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-lg bg-[#214232] py-3 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] disabled:opacity-60 cursor-pointer"
                >
                  {authLoading ? 'Mengaktifkan...' : 'Aktifkan Dashboard Administrator'}
                </button>
              </form>
            </>
          ) : bootstrap?.envPasscodeConfigured ? (
            <>
              <h1 className="mt-3 font-editorial text-2xl font-semibold text-[#1A2B22]">
                Masuk Dashboard Administrator
              </h1>
              <p className="mt-2 text-sm text-[#4A5D52]">
                Masukkan passcode administrator atau gunakan akun admin terdaftar untuk mengakses
                pengelolaan perpustakaan.
              </p>

              {authError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-[#D8B4B4] bg-[#FBF2F2] px-3.5 py-2.5 text-sm text-[#7F2D2D]"
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handlePasscodeLogin} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="admin-passcode"
                    className="block text-sm font-medium text-[#1A2B22]"
                  >
                    Passcode Administrator
                  </label>
                  <input
                    id="admin-passcode"
                    type="password"
                    required
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Masukkan passcode"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-lg bg-[#214232] py-3 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] disabled:opacity-60 cursor-pointer"
                >
                  {authLoading ? 'Memverifikasi...' : 'Masuk dengan Passcode'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-editorial text-2xl font-semibold text-[#1A2B22]">
                Masuk sebagai Administrator
              </h1>
              <p className="mt-2 text-sm text-[#4A5D52]">
                Halaman ini khusus pengelola perpustakaan. Masuk dengan email dan kata sandi
                administrator Anda.
              </p>

              {authError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-[#D8B4B4] bg-[#FBF2F2] px-3.5 py-2.5 text-sm text-[#7F2D2D]"
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handleAdminEmailLogin} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="adm-email" className="block text-sm font-medium text-[#1A2B22]">
                    Email Administrator
                  </label>
                  <input
                    id="adm-email"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="adm-pass" className="block text-sm font-medium text-[#1A2B22]">
                    Kata Sandi
                  </label>
                  <input
                    id="adm-pass"
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD3CA] bg-white px-3.5 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-lg bg-[#214232] py-3 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] disabled:opacity-60 cursor-pointer"
                >
                  {authLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    );
  }

  // --- Authenticated Admin Dashboard ---
  const q = tableSearch.trim().toLowerCase();
  const filteredBooks = books.filter(
    (b) =>
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q)
  );
  const filteredMembers = (overview?.members || []).filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );
  const filteredLoans = (overview?.loans || []).filter(
    (l) =>
      !q ||
      l.bookTitle.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.userEmail.toLowerCase().includes(q)
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#DFDDD2] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#4A5D52]">
            Dashboard Administrator
          </p>
          <h1 className="mt-1 font-editorial text-3xl font-semibold text-[#1A2B22]">
            Pengelolaan Koleksi & Anggota
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateBookModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#214232] px-4 py-2.5 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] whitespace-nowrap cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {/* 4 KPI Strip */}
      <div className="mt-6 grid grid-cols-2 divide-y divide-[#DFDDD2] rounded-xl border border-[#DFDDD2] bg-[#FBF9F4] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-xs font-medium text-[#4A5D52]">Total Judul Buku</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
            {overview?.stats.totalTitles ?? books.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#4A5D52]">Eksemplar Tersedia</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
            {overview?.stats.availableCopies ?? books.reduce((s, b) => s + b.availableCopies, 0)}{' '}
            <span className="text-sm font-normal text-[#4A5D52]">
              / {overview?.stats.totalCopies ?? books.reduce((s, b) => s + b.totalCopies, 0)}
            </span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#4A5D52]">Anggota Terdaftar</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
            {overview?.stats.totalMembers ?? 0}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#4A5D52]">Peminjaman Aktif</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
            {overview?.stats.activeLoans ?? 0}
          </p>
        </div>
      </div>

      {/* Tabs & Table Search */}
      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div role="tablist" className="flex gap-1 rounded-lg bg-[#EDEAE0] p-1">
          {[
            { id: 'books', label: 'Koleksi Buku' },
            { id: 'members', label: 'Anggota' },
            { id: 'loans', label: 'Peminjaman' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as 'books' | 'members' | 'loans')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FBF9F4] text-[#1A2B22] shadow-xs'
                  : 'text-[#4A5D52] hover:text-[#1A2B22]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#4A5D52]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Cari di tabel ini..."
            className="h-10 w-full rounded-lg border border-[#CBD3CA] bg-[#FBF9F4] pr-3 pl-9 text-sm text-[#1A2B22] focus:border-[#214232] focus:outline-none"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-[#DFDDD2] bg-[#FBF9F4]">
        {loadingOverview && !overview ? (
          <div className="p-8 text-center text-sm text-[#4A5D52]">Memuat data dashboard...</div>
        ) : activeTab === 'books' ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DFDDD2] bg-[#F0ECE1]/70 text-xs text-[#4A5D52]">
              <tr>
                <th className="px-4 py-3 font-medium">Judul & Penulis</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium text-right">Stok</th>
                <th className="px-4 py-3 font-medium text-right">Dibaca</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D9]">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-[#F8F5EE]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A2B22]">{book.title}</p>
                    <p className="text-xs text-[#4A5D52]">
                      {book.author} · <span className="font-mono">{book.isbn}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A5D52]">{book.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#1A2B22]">
                    {book.availableCopies} / {book.totalCopies}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#4A5D52]">
                    {book.readCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === book.id ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteBook(book.id)}
                          className="rounded-md bg-[#8C2F2F] px-2.5 py-1 text-xs font-medium text-white cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-md border border-[#CBD3CA] px-2.5 py-1 text-xs text-[#4A5D52] cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditBookModal(book)}
                          aria-label={`Edit ${book.title}`}
                          className="rounded-lg border border-[#CBD3CA] p-2 text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(book.id)}
                          aria-label={`Hapus ${book.title}`}
                          className="rounded-lg border border-[#DFCCCC] p-2 text-[#7F2D2D] hover:bg-[#FBF2F2] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#4A5D52]">
                    Tidak ada buku ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : activeTab === 'members' ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DFDDD2] bg-[#F0ECE1]/70 text-xs text-[#4A5D52]">
              <tr>
                <th className="px-4 py-3 font-medium">Nama & Email</th>
                <th className="px-4 py-3 font-medium">Peran</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Pinjaman Aktif</th>
                <th className="px-4 py-3 font-medium text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D9]">
              {filteredMembers.map((member) => {
                const isSelf = member.id === currentUser?.id;
                return (
                  <tr key={member.id} className="hover:bg-[#F8F5EE]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A2B22]">{member.name}</p>
                      <p className="text-xs text-[#4A5D52]">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1A2B22]">
                      {member.role === 'admin' ? 'Administrator' : 'Anggota'}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      <span
                        className={
                          member.status === 'active' ? 'text-[#214232]' : 'text-[#8C2F2F]'
                        }
                      >
                        {member.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#1A2B22]">
                      {member.activeLoansCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSelf ? (
                        <span className="text-xs text-[#4A5D52]">Akun Anda</span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleMemberStatus(member)}
                            className="rounded-lg border border-[#CBD3CA] px-2.5 py-1.5 text-xs font-medium text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
                          >
                            {member.status === 'active' ? 'Tangguhkan' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMemberRole(member)}
                            className="rounded-lg border border-[#CBD3CA] px-2.5 py-1.5 text-xs font-medium text-[#4A5D52] hover:bg-[#EDF1EC] cursor-pointer"
                          >
                            {member.role === 'admin' ? 'Jadikan Anggota' : 'Jadikan Admin'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#4A5D52]">
                    Belum ada anggota terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DFDDD2] bg-[#F0ECE1]/70 text-xs text-[#4A5D52]">
              <tr>
                <th className="px-4 py-3 font-medium">Buku</th>
                <th className="px-4 py-3 font-medium">Peminjam</th>
                <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D9]">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-[#F8F5EE]">
                  <td className="px-4 py-3 font-medium text-[#1A2B22]">{loan.bookTitle}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-[#1A2B22]">{loan.userName}</p>
                    <p className="text-xs text-[#4A5D52]">{loan.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#4A5D52]">
                    {new Date(loan.dueAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    <span className={loan.status === 'active' ? 'text-[#8C4A32]' : 'text-[#214232]'}>
                      {loan.status === 'active' ? 'Dipinjam' : 'Dikembalikan'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {loan.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => handleAdminReturnLoan(loan.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#CBD3CA] px-2.5 py-1.5 text-xs font-medium text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Tandai Dikembalikan</span>
                      </button>
                    ) : (
                      <span className="text-xs text-[#4A5D52]">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#4A5D52]">
                    Belum ada catatan peminjaman.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {bookModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1A2B22]/45 p-4 backdrop-blur-[2px]"
        >
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-[#DFDDD2] bg-[#FBF9F4] p-6 shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 id="book-modal-title" className="font-editorial text-2xl font-semibold text-[#1A2B22]">
                {editingBookId ? 'Edit Koleksi Buku' : 'Tambah Buku Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setBookModalOpen(false)}
                aria-label="Tutup form buku"
                className="rounded-lg p-1.5 text-[#4A5D52] hover:bg-[#EDF1EC] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookFormError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-[#D8B4B4] bg-[#FBF2F2] px-3.5 py-2.5 text-sm text-[#7F2D2D]"
              >
                {bookFormError}
              </div>
            )}

            <form onSubmit={handleSaveBook} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Judul Buku</label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Penulis</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Kategori</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, category: e.target.value as BookCategory })
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Tahun Terbit</label>
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={bookForm.year}
                    onChange={(e) => setBookForm({ ...bookForm, year: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Jumlah Stok</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={bookForm.totalCopies}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Penerbit</label>
                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">ISBN</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="978-623-..."
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">Halaman</label>
                  <input
                    type="number"
                    min={1}
                    value={bookForm.pages}
                    onChange={(e) => setBookForm({ ...bookForm, pages: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B22]">Desain Sampul</label>
                <select
                  value={bookForm.coverUrl}
                  onChange={(e) => {
                    const preset = COVER_PRESETS.find((p) => p.url === e.target.value);
                    setBookForm({
                      ...bookForm,
                      coverUrl: e.target.value,
                      coverTone: preset?.tone || 'cream-sage',
                    });
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-[#CBD3CA] bg-white px-3 text-sm focus:border-[#214232] focus:outline-none"
                >
                  {COVER_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-[#1A2B22]">Fitur Aksesibilitas</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {ACCESSIBILITY_FEATURES.map((feat) => {
                    const checked = bookForm.accessibilityFeatures.includes(feat);
                    return (
                      <label
                        key={feat}
                        className="inline-flex items-center gap-2 text-sm text-[#3D5245] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? bookForm.accessibilityFeatures.filter((f) => f !== feat)
                              : [...bookForm.accessibilityFeatures, feat];
                            setBookForm({ ...bookForm, accessibilityFeatures: next });
                          }}
                          className="h-4 w-4 accent-[#214232]"
                        />
                        <span>{feat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B22]">Sinopsis</label>
                <textarea
                  rows={3}
                  required
                  value={bookForm.synopsis}
                  onChange={(e) => setBookForm({ ...bookForm, synopsis: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#CBD3CA] bg-white p-3 text-sm focus:border-[#214232] focus:outline-none"
                />
              </div>

              {!editingBookId && (
                <div>
                  <label className="block text-sm font-medium text-[#1A2B22]">
                    Isi Bab Pertama (untuk Digital Reader)
                  </label>
                  <textarea
                    rows={4}
                    value={bookForm.chapterBody}
                    onChange={(e) => setBookForm({ ...bookForm, chapterBody: e.target.value })}
                    placeholder="Tulis paragraf pembuka buku agar bisa langsung dibaca di Digital Reader..."
                    className="mt-1 w-full rounded-lg border border-[#CBD3CA] bg-white p-3 text-sm focus:border-[#214232] focus:outline-none"
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-[#1A2B22] cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookForm.featured}
                  onChange={(e) => setBookForm({ ...bookForm, featured: e.target.checked })}
                  className="h-4 w-4 accent-[#214232]"
                />
                <span>Tampilkan di Koleksi Pilihan Beranda</span>
              </label>

              <div className="flex justify-end gap-3 border-t border-[#DFDDD2] pt-4">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="rounded-lg border border-[#CBD3CA] px-4 py-2.5 text-sm font-medium text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bookSaving}
                  className="rounded-lg bg-[#214232] px-5 py-2.5 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] disabled:opacity-60 cursor-pointer"
                >
                  {bookSaving ? 'Menyimpan...' : editingBookId ? 'Simpan Perubahan' : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
