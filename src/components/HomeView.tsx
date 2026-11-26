import { useState } from 'react';
import { ArrowRight, BookOpen, Eye, Headphones, Type } from 'lucide-react';
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

const CATEGORIES: { name: BookCategory; description: string }[] = [
  { name: 'Sastra & Fiksi', description: 'Cerita hangat lintas generasi dengan bahasa jernih.' },
  { name: 'Sains & Ekologi', description: 'Pengetahuan alam dan lingkungan yang membumi.' },
  { name: 'Sejarah & Budaya', description: 'Jejak peradaban dan desain ruang publik inklusif.' },
  { name: 'Pendidikan & Inklusi', description: 'Panduan belajar terbuka untuk pendidik dan keluarga.' },
  { name: 'Pengembangan Diri', description: 'Bacaan tenang untuk fokus dan keseharian.' },
  { name: 'Cerita Anak & Remaja', description: 'Kisah ramah pembaca pemula dengan huruf lega.' },
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
      {/* Hero Split Section */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 lg:pt-14">
        <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium tracking-wide text-[#4A5D52]">
              Perpustakaan Digital Inklusif
            </p>
            <h1 className="mt-3 font-editorial text-4xl font-semibold leading-[1.15] tracking-tight text-[#1A2B22] text-balance sm:text-5xl">
              Ruang baca yang tenang, terbuka, dan ramah untuk semua.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4A5D52] sm:text-lg">
              SENA LIBRARY menghadirkan koleksi bacaan pilihan dengan tampilan lembut di mata,
              pengaturan huruf fleksibel, dan akses peminjaman yang sederhana bagi seluruh kalangan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigateCatalog('Semua')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#214232] px-6 py-3 text-base font-medium text-[#FBF9F4] transition-colors hover:bg-[#183326] whitespace-nowrap cursor-pointer"
              >
                <span>Jelajahi Katalog</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {displayBooks[0] && (
                <button
                  type="button"
                  onClick={() => onReadBook(displayBooks[0])}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#CBD3CA] bg-[#FBF9F4] px-5 py-3 text-base font-medium text-[#1A2B22] transition-colors hover:bg-[#EDF1EC] whitespace-nowrap cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-[#214232]" aria-hidden="true" />
                  <span>Coba Digital Reader</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            {!heroImgFailed ? (
              <div className="h-full min-h-[280px] overflow-hidden rounded-2xl border border-[#DFDDD2] bg-[#EAE6DA]">
                <img
                  src="/src/assets/images/hero_sena_library_1795659417977.jpg"
                  alt="Suasana ruang baca SENA LIBRARY yang tenang dengan pencahayaan alami, meja kayu, dan kursi hijau sage"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col justify-end rounded-2xl border border-[#DFDDD2] bg-gradient-to-br from-[#EFECE3] via-[#DDE5DD] to-[#C8D6C8] p-8">
                <p className="font-editorial text-2xl font-semibold text-[#1A2B22]">
                  Ruang Baca Terbuka SENA
                </p>
                <p className="mt-2 text-sm text-[#4A5D52]">
                  Akses literasi yang nyaman, tenang, dan inklusif kapan saja.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-Width 4-Column Library Operational Strip */}
        <div className="mt-10 grid grid-cols-2 divide-y divide-[#DFDDD2] rounded-xl border border-[#DFDDD2] bg-[#FBF9F4] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <p className="text-xs font-medium text-[#4A5D52]">Judul Koleksi</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
              {books.length}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-[#4A5D52]">Eksemplar Tersedia</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
              {availableCopies} <span className="text-sm font-normal text-[#4A5D52]">/ {totalCopies}</span>
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-[#4A5D52]">Kategori Inklusif</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
              {CATEGORIES.length}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-[#4A5D52]">Total Pembacaan</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#1A2B22]">
              {totalReads}
            </p>
          </div>
        </div>
      </section>

      {/* Kategori Koleksi */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#DFDDD2] pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1A2B22] sm:text-3xl">
              Kategori Koleksi
            </h2>
            <p className="mt-1 text-sm text-[#4A5D52]">
              Pilih bidang bacaan sesuai minat dan kebutuhan belajar Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog('Semua')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#214232] hover:underline whitespace-nowrap cursor-pointer"
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
                className="group flex flex-col justify-between rounded-xl border border-[#DFDDD2] bg-[#FBF9F4] p-5 text-left transition-colors hover:border-[#8AA38D] hover:bg-[#F1F4EF] cursor-pointer"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-editorial text-lg font-semibold text-[#1A2B22] group-hover:text-[#214232]">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-[#4A5D52]">
                    {count} buku
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Koleksi Pilihan */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#DFDDD2] pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1A2B22] sm:text-3xl">
              Koleksi Pilihan Bulan Ini
            </h2>
            <p className="mt-1 text-sm text-[#4A5D52]">
              Bacaan kurasi yang siap langsung Anda baca secara digital atau dipinjam.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog('Semua')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#214232] hover:underline whitespace-nowrap cursor-pointer"
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
        <div className="rounded-2xl border border-[#D4DCD2] bg-[#EAF0E8] p-6 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="font-editorial text-2xl font-semibold text-[#1A2B22] sm:text-3xl text-balance">
              Pengalaman membaca yang menyesuaikan kebutuhan Anda
            </h2>
            <p className="mt-2 text-base text-[#3D5245]">
              Setiap pembaca memiliki kenyamanan berbeda. Digital Reader SENA LIBRARY dilengkapi
              kontrol aksesibilitas langsung tanpa pengaturan rumit.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#CBD6C8] bg-[#FBF9F4] p-5">
              <Type className="h-5 w-5 text-[#214232]" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-[#1A2B22]">
                Ukuran & Gaya Huruf Fleksibel
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4A5D52]">
                Perbesar teks hingga 26px, atur jarak antarbaris lega, serta pilih huruf sans-serif
                yang ramah bagi pembaca disleksia.
              </p>
            </div>

            <div className="rounded-xl border border-[#CBD6C8] bg-[#FBF9F4] p-5">
              <Eye className="h-5 w-5 text-[#214232]" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-[#1A2B22]">
                Warna Lembut Bebas Silau
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4A5D52]">
                Pilih latar kertas krem hangat, putih bersih, atau hijau malam lembut serta panduan
                fokus baris saat membaca lama.
              </p>
            </div>

            <div className="rounded-xl border border-[#CBD6C8] bg-[#FBF9F4] p-5">
              <Headphones className="h-5 w-5 text-[#214232]" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-[#1A2B22]">
                Fitur Baca Suara Terpadu
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4A5D52]">
                Dengarkan isi bab langsung melalui pemutar suara peramban untuk membantu pembaca
                dengan hambatan penglihatan atau kelelahan mata.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
