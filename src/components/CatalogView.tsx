import { Search, X } from 'lucide-react';
import { AccessibilityFeature, Book, BookCategory } from '../types/library.ts';
import { BookCard } from './BookCard.tsx';

interface CatalogViewProps {
  books: Book[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: BookCategory | 'Semua';
  availabilityFilter: 'all' | 'available' | 'borrowed';
  accessibilityFilter: AccessibilityFeature | 'Semua';
  sortBy: 'newest' | 'title-asc' | 'popular';
  favorites: string[];
  activeLoanBookIds: Set<string>;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: BookCategory | 'Semua') => void;
  onAvailabilityChange: (val: 'all' | 'available' | 'borrowed') => void;
  onAccessibilityChange: (val: AccessibilityFeature | 'Semua') => void;
  onSortChange: (val: 'newest' | 'title-asc' | 'popular') => void;
  onResetFilters: () => void;
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}

const CATEGORIES: (BookCategory | 'Semua')[] = [
  'Semua',
  'Sastra & Fiksi',
  'Sains & Ekologi',
  'Sejarah & Budaya',
  'Pendidikan & Inklusi',
  'Pengembangan Diri',
  'Cerita Anak & Remaja',
];

const ACCESSIBILITY_OPTIONS: (AccessibilityFeature | 'Semua')[] = [
  'Semua',
  'Ramah Disleksia',
  'Teks Besar',
  'Struktur Bab Jelas',
  'Ringkasan Suara',
];

export function CatalogView({
  books,
  loading,
  searchQuery,
  selectedCategory,
  availabilityFilter,
  accessibilityFilter,
  sortBy,
  favorites,
  activeLoanBookIds,
  onSearchChange,
  onCategoryChange,
  onAvailabilityChange,
  onAccessibilityChange,
  onSortChange,
  onResetFilters,
  onSelectBook,
  onReadBook,
  onToggleFavorite,
}: CatalogViewProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Semua' ||
    availabilityFilter !== 'all' ||
    accessibilityFilter !== 'Semua';

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-[#E6E0D0] bg-gradient-to-r from-[#EFF7F0] via-[#FFFDF7] to-[#FEF8E7] p-6 sm:p-8">
        <h1 className="font-editorial text-3xl font-bold text-[#173326] sm:text-4xl">
          Katalog Digital SENA
        </h1>
        <p className="mt-2 max-w-2xl text-base text-[#456354]">
          Temukan bacaan favoritmu berdasarkan judul, penulis, kategori, ketersediaan pinjam, atau
          fitur aksesibilitas baca.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="mt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#456354]"
              aria-hidden="true"
            />
            <label htmlFor="catalog-search" className="sr-only">
              Cari buku di katalog
            </label>
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari judul buku, nama penulis, topik, atau ISBN..."
              className="h-11 w-full rounded-xl border border-[#D8D2C2] bg-white pr-10 pl-10 text-sm text-[#173326] placeholder:text-[#6D8578] focus:border-[#1F563E] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Hapus kata pencarian"
                className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#456354] hover:bg-[#EFF7F0] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="availability-select" className="sr-only">
              Filter ketersediaan
            </label>
            <select
              id="availability-select"
              value={availabilityFilter}
              onChange={(e) =>
                onAvailabilityChange(e.target.value as 'all' | 'available' | 'borrowed')
              }
              className="h-11 w-full rounded-xl border border-[#D8D2C2] bg-white px-3 text-sm text-[#173326] focus:border-[#1F563E] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia Dipinjam</option>
              <option value="borrowed">Dipinjam Penuh</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="accessibility-select" className="sr-only">
              Filter aksesibilitas
            </label>
            <select
              id="accessibility-select"
              value={accessibilityFilter}
              onChange={(e) =>
                onAccessibilityChange(e.target.value as AccessibilityFeature | 'Semua')
              }
              className="h-11 w-full rounded-xl border border-[#D8D2C2] bg-white px-3 text-sm text-[#173326] focus:border-[#1F563E] focus:outline-none cursor-pointer"
            >
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'Semua' ? 'Semua Aksesibilitas' : opt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="sort-select" className="sr-only">
              Urutkan koleksi
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'newest' | 'title-asc' | 'popular')}
              className="h-11 w-full rounded-xl border border-[#D8D2C2] bg-white px-3 text-sm text-[#173326] focus:border-[#1F563E] focus:outline-none cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="title-asc">Judul A–Z</option>
              <option value="popular">Sering Dibaca</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter kategori buku"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(cat)}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1F563E] text-[#FFFDF7]'
                    : 'border border-[#E6E0D0] bg-white text-[#456354] hover:bg-[#FDF5DC] hover:text-[#173326]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="mt-6 flex items-center justify-between text-sm text-[#456354]">
        <p>
          Menampilkan{' '}
          <span className="font-mono font-semibold tabular-nums text-[#173326]">{books.length}</span>{' '}
          judul buku
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="font-semibold text-[#1F563E] hover:underline cursor-pointer"
          >
            Atur ulang filter
          </button>
        )}
      </div>

      {/* Book Grid / Loading / Empty State */}
      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-96 animate-pulse rounded-2xl border border-[#E6E0D0] bg-[#F5F0E2]"
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#E6E0D0] bg-white px-6 py-14 text-center">
          <h2 className="font-editorial text-xl font-bold text-[#173326]">
            Belum ada buku yang cocok dengan pencarianmu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#456354]">
            Coba gunakan kata kunci yang lebih umum atau tampilkan kembali seluruh koleksi katalog.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 rounded-xl bg-[#1F563E] px-5 py-2.5 text-sm font-semibold text-[#FFFDF7] hover:bg-[#17422F] cursor-pointer"
          >
            Tampilkan Semua Koleksi
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
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
      )}
    </section>
  );
}
