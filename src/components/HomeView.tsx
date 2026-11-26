import { useState } from 'react';
import { ArrowRight, BookOpen, Eye, Headphones, Sun, Type } from 'lucide-react';
import { Book, BookCategory } from '../types/library.ts';
import { BookCard } from './BookCard.tsx';

interface HomeViewProps {
  books: Book[];
  favorites: string[];
  activeLoanBookIds: Set<string>;
  onNavigateCatalog: (category?: BookCategory | 'Semua') => void;
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}

const CATEGORIES: {
  name: BookCategory;
  description: string;
  surfaceClass: string;
  borderClass: string;
}[] = [
  {
    name: 'Sastra & Fiksi',
    description: 'Cerita hangat lintas generasi dengan bahasa yang mengalir ringan.',
    surfaceClass: 'bg-[#F2F8F3] hover:bg-[#E4F2E7]',
    borderClass: 'border-[#CFE3D2]',
  },
  {
    name: 'Sains & Ekologi',
    description: 'Jelajahi keajaiban alam dan lingkungan dengan penjelasan membumi.',
    surfaceClass: 'bg-[#FEF8E7] hover:bg-[#FCEEC5]',
    borderClass: 'border-[#EFE0B1]',
  },
  {
    name: 'Sejarah & Budaya',
    description: 'Kisah peradaban Nusantara dan ruang publik yang ramah bersama.',
    surfaceClass: 'bg-[#FDF1EB] hover:bg-[#FAE1D5]',
    borderClass: 'border-[#F0CFC0]',
  },
  {
    name: 'Pendidikan & Inklusi',
    description: 'Panduan belajar terbuka untuk pelajar, pendidik, dan keluarga.',
    surfaceClass: 'bg-[#EDF6F4] hover:bg-[#DCEEE9]',
    borderClass: 'border-[#C6E1DA]',
  },
  {
    name: 'Pengembangan Diri',
    description: 'Bacaan positif untuk menjaga fokus, semangat, dan ketenangan.',
    surfaceClass: 'bg-[#FAF5E8] hover:bg-[#F5E9CB]',
    borderClass: 'border-[#E8DAB8]',
  },
  {
    name: 'Cerita Anak & Remaja',
    description: 'Petualangan penuh imajinasi dengan huruf lega dan ramah pemula.',
    surfaceClass: 'bg-[#F0F7ED] hover:bg-[#E0EFE0]',
    borderClass: 'border-[#CEE2C9]',
  },
];

export function HomeView({
  books,
  favorites,
  activeLoanBookIds,
  onNavigateCatalog,
  onSelectBook,
  onReadBook,
  onToggleFavorite,
}: HomeViewProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const featuredBooks = books.filter((b) => b.featured).slice(0, 4);
  const displayBooks = featuredBooks.length > 0 ? featuredBooks : books.slice(0, 4);
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const totalReads = books.reduce((sum, b) => sum + b.readCount, 0);

  return (
    <div>
      {/* Cheerful Split Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 lg:pt-14">
        <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F563E]">
              <Sun className="h-4 w-4 text-[#D99B26]" aria-hidden="true" />
              <span>Selamat Datang di SENA LIBRARY</span>
            </div>

            <h1 className="mt-3 font-editorial text-4xl font-bold leading-[1.15] tracking-tight text-[#173326] text-balance sm:text-5xl">
              Temukan bacaan seru yang bikin harimu lebih cerah.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#456354] sm:text-lg">
              Perpustakaan digital inklusif yang ceria, nyaman di mata, dan terbuka hangat untuk
              semua kalangan—lengkap dengan pengaturan huruf fleksibel dan peminjaman praktis.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigateCatalog('Semua')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1F563E] px-6 py-3.5 text-base font-semibold text-[#FFFDF7] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#17422F] whitespace-nowrap cursor-pointer"
              >
                <span>Jelajahi Katalog</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {displayBooks[0] && (
                <button
                  type="button"
                  onClick={() => onReadBook(displayBooks[0])}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#ECD79A] bg-[#FDF1CC] px-5 py-3.5 text-base font-semibold text-[#173326] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FCE6A6] whitespace-nowrap cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-[#1F563E]" aria-hidden="true" />
                  <span>Coba Digital Reader</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            {!heroImgFailed ? (
              <div className="h-full min-h-[280px] overflow-hidden rounded-3xl border border-[#E6E0D0] bg-[#FAF4E4] shadow-sm">
                <img
                  src="/src/assets/images/hero_sena_cheerful_1795661176395.jpg"
                  alt="Suasana ceria ruang baca SENA LIBRARY yang bermandikan cahaya matahari pagi dengan pembaca dari berbagai usia"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col justify-end rounded-3xl border border-[#E6E0D0] bg-gradient-to-br from-[#FEF6DB] via-[#E9F3EA] to-[#D4E8D7] p-8">
                <p className="font-editorial text-2xl font-bold text-[#173326]">
                  Ruang Baca Ceria SENA
                </p>
                <p className="mt-2 text-sm text-[#456354]">
                  Akses literasi yang hangat, menyenangkan, dan inklusif kapan saja.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-Width 4-Column Operational Strip */}
        <div className="mt-10 grid grid-cols-2 divide-y divide-[#E6E0D0] rounded-2xl border border-[#E6E0D0] bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <p className="text-xs font-semibold text-[#456354]">Judul Koleksi</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1F563E]">
              {books.length}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-[#456354]">Eksemplar Tersedia</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1F563E]">
              {availableCopies}{' '}
              <span className="text-sm font-normal text-[#456354]">/ {totalCopies}</span>
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-[#456354]">Kategori Ceria</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1F563E]">
              {CATEGORIES.length}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-[#456354]">Total Pembacaan</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1F563E]">
              {totalReads}
            </p>
          </div>
        </div>
      </section>

      {/* Kategori Koleksi */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E6E0D0] pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#173326] sm:text-3xl">
              Kategori Bacaan Pilihan
            </h2>
            <p className="mt-1 text-sm text-[#456354]">
              Pilih topik favoritmu dan mulai membaca sesuai suasana hati hari ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog('Semua')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F563E] hover:underline whitespace-nowrap cursor-pointer"
          >
            <span>Lihat semua kategori</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const count = books.filter((b) => b.category === cat.name).length;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onNavigateCatalog(cat.name)}
                className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${cat.surfaceClass} ${cat.borderClass}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-editorial text-lg font-bold text-[#173326] group-hover:text-[#1F563E]">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-xs font-medium tabular-nums text-[#456354]">
                    {count} buku
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#3E584A]">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Koleksi Pilihan */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E6E0D0] pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#173326] sm:text-3xl">
              Rekomendasi Hangat Bulan Ini
            </h2>
            <p className="mt-1 text-sm text-[#456354]">
              Buku-buku favorit anggota yang siap menemani waktu santai maupun belajarmu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog('Semua')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F563E] hover:underline whitespace-nowrap cursor-pointer"
          >
            <span>Buka katalog lengkap</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={favorites.includes(book.id)}
              isBorrowedByUser={activeLoanBookIds.has(book.id)}
              onSelectBook={onSelectBook}
              onReadBook={onReadBook}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Komitmen Inklusivitas */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-[#CFE3D2] bg-gradient-to-br from-[#ECF6EE] via-[#F4F9F2] to-[#FEF8E7] p-6 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="font-editorial text-2xl font-bold text-[#173326] sm:text-3xl text-balance">
              Membaca jadi menyenangkan untuk setiap cara belajar
            </h2>
            <p className="mt-2 text-base text-[#3E584A]">
              Sesuaikan tampilan Digital Reader SENA LIBRARY hanya dengan sekali sentuh agar mata
              tetap segar dan nyaman.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D8E5D8] bg-white p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF1CC] text-[#1F563E]">
                <Type className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base font-bold text-[#173326]">
                Ukuran & Gaya Huruf Fleksibel
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#456354]">
                Perbesar teks hingga 26px, atur jarak baris lega, dan pilih huruf sans-serif ramah
                pembaca disleksia.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D8E5D8] bg-white p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F2E7] text-[#1F563E]">
                <Eye className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base font-bold text-[#173326]">
                Warna Lembut Bebas Silau
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#456354]">
                Pilih latar krem hangat, putih bersih, atau hijau malam lembut serta fitur fokus
                baris agar membaca lebih betah.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D8E5D8] bg-white p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEAE3] text-[#B84A2B]">
                <Headphones className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base font-bold text-[#173326]">
                Fitur Baca Suara Terpadu
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#456354]">
                Dengarkan isi bab langsung melalui pemutar suara peramban untuk pengalaman membaca
                yang lebih inklusif.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
