import { ArrowLeft, BookOpen, CheckCircle2, Heart, RotateCcw } from 'lucide-react';
import { Book, Loan } from '../types/library.ts';
import { BookCover } from './BookCover.tsx';

interface BookDetailViewProps {
  book: Book;
  isFavorite: boolean;
  activeLoan?: Loan;
  actionPending: boolean;
  onBack: () => void;
  onReadBook: (book: Book, chapterIndex?: number) => void;
  onBorrowBook: (bookId: string) => void;
  onReturnLoan: (loanId: string) => void;
  onToggleFavorite: (bookId: string) => void;
}

export function BookDetailView({
  book,
  isFavorite,
  activeLoan,
  actionPending,
  onBack,
  onReadBook,
  onBorrowBook,
  onReturnLoan,
  onToggleFavorite,
}: BookDetailViewProps) {
  const isAvailable = book.availableCopies > 0;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D52] hover:text-[#1A2B22] cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Kembali ke Katalog</span>
      </button>

      <div className="mt-6 grid gap-10 md:grid-cols-12">
        {/* Left: Book Cover */}
        <div className="md:col-span-4">
          <BookCover book={book} className="aspect-[3/4] w-full max-w-xs md:max-w-none" />
        </div>

        {/* Right: Editorial Details */}
        <div className="md:col-span-8">
          <p className="text-sm font-medium text-[#4A5D52]">
            {book.category} <span aria-hidden="true">·</span>{' '}
            <span className="font-mono tabular-nums">{book.year}</span>
          </p>
          <h1 className="mt-2 font-editorial text-3xl font-semibold leading-tight text-[#1A2B22] sm:text-4xl text-balance">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-[#4A5D52]">Oleh {book.author}</p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onReadBook(book, 0)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#214232] px-5 py-3 text-sm font-medium text-[#FBF9F4] transition-colors hover:bg-[#183326] whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Baca Digital Sekarang</span>
            </button>

            {activeLoan ? (
              <button
                type="button"
                disabled={actionPending}
                onClick={() => onReturnLoan(activeLoan.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#214232] bg-[#DCE5DC] px-5 py-3 text-sm font-medium text-[#1A2B22] transition-colors hover:bg-[#CBD8CB] disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>{actionPending ? 'Memproses...' : 'Kembalikan Buku'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!isAvailable || actionPending}
                onClick={() => onBorrowBook(book.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#CBD3CA] bg-[#FBF9F4] px-5 py-3 text-sm font-medium text-[#1A2B22] transition-colors hover:bg-[#EDF1EC] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#214232]" aria-hidden="true" />
                <span>
                  {actionPending
                    ? 'Memproses...'
                    : isAvailable
                    ? 'Pinjam Buku (7 Hari)'
                    : 'Stok Dipinjam Penuh'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleFavorite(book.id)}
              aria-pressed={isFavorite}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isFavorite
                  ? 'border-[#214232] bg-[#EDF1EC] text-[#1A2B22]'
                  : 'border-[#CBD3CA] bg-[#FBF9F4] text-[#4A5D52] hover:text-[#1A2B22]'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#214232] text-[#214232]' : ''}`} />
              <span>{isFavorite ? 'Tersimpan di Favorit' : 'Simpan Favorit'}</span>
            </button>
          </div>

          {/* Synopsis */}
          <div className="mt-8 border-t border-[#DFDDD2] pt-6">
            <h2 className="text-base font-semibold text-[#1A2B22]">Ringkasan Buku</h2>
            <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-[#3D5245]">
              {book.synopsis}
            </p>
          </div>

          {/* Accession Metadata Grid */}
          <dl className="mt-8 divide-y divide-[#DFDDD2] border-y border-[#DFDDD2] text-sm">
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#4A5D52]">Ketersediaan</dt>
              <dd className="col-span-2 font-medium text-[#1A2B22] font-mono tabular-nums">
                {book.availableCopies} dari {book.totalCopies} eksemplar tersedia
              </dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#4A5D52]">Penerbit & Tahun</dt>
              <dd className="col-span-2 text-[#1A2B22]">
                {book.publisher} · <span className="font-mono tabular-nums">{book.year}</span>
              </dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#4A5D52]">Nomor ISBN</dt>
              <dd className="col-span-2 font-mono tabular-nums text-[#1A2B22]">{book.isbn}</dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#4A5D52]">Jumlah Halaman</dt>
              <dd className="col-span-2 font-mono tabular-nums text-[#1A2B22]">
                {book.pages} halaman ({book.language})
              </dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#4A5D52]">Dukungan Aksesibilitas</dt>
              <dd className="col-span-2 text-[#1A2B22]">
                {book.accessibilityFeatures.join(' · ')}
              </dd>
            </div>
          </dl>

          {/* Table of Contents */}
          <div className="mt-8">
            <h2 className="text-base font-semibold text-[#1A2B22]">
              Daftar Bab ({book.chapters.length} Bab)
            </h2>
            <div className="mt-3 divide-y divide-[#DFDDD2] rounded-xl border border-[#DFDDD2] bg-[#FBF9F4]">
              {book.chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onReadBook(book, idx)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[#EDF1EC] cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A2B22]">{chapter.title}</p>
                    <p className="mt-0.5 text-xs text-[#4A5D52]">
                      Estimasi baca <span className="font-mono tabular-nums">{chapter.estimatedMinutes}</span> menit
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#214232] whitespace-nowrap">
                    Baca bab ini
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
