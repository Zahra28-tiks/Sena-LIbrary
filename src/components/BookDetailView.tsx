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
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#456354] hover:text-[#1F563E] cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Kembali ke Katalog</span>
      </button>

      <div className="mt-6 grid gap-10 rounded-3xl border border-[#E6E0D0] bg-white p-6 sm:p-8 md:grid-cols-12">
        {/* Left: Book Cover */}
        <div className="md:col-span-4">
          <BookCover book={book} className="aspect-[3/4] w-full max-w-xs rounded-2xl md:max-w-none" />
        </div>

        {/* Right: Editorial Details */}
        <div className="md:col-span-8">
          <p className="text-sm font-semibold text-[#1F563E]">
            {book.category} <span aria-hidden="true">·</span>{' '}
            <span className="font-mono tabular-nums">{book.year}</span>
          </p>
          <h1 className="mt-2 font-editorial text-3xl font-bold leading-tight text-[#173326] sm:text-4xl text-balance">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-[#456354]">Oleh {book.author}</p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onReadBook(book, 0)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F563E] px-5 py-3 text-sm font-semibold text-[#FFFDF7] transition-colors hover:bg-[#17422F] whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Baca Digital Sekarang</span>
            </button>

            {activeLoan ? (
              <button
                type="button"
                disabled={actionPending}
                onClick={() => onReturnLoan(activeLoan.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#CFE3D2] bg-[#EFF7F0] px-5 py-3 text-sm font-semibold text-[#173326] transition-colors hover:bg-[#DFF0E2] disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-[#1F563E]" aria-hidden="true" />
                <span>{actionPending ? 'Memproses...' : 'Kembalikan Buku'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!isAvailable || actionPending}
                onClick={() => onBorrowBook(book.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#ECD79A] bg-[#FDF1CC] px-5 py-3 text-sm font-semibold text-[#173326] transition-colors hover:bg-[#FCE6A6] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#1F563E]" aria-hidden="true" />
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
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isFavorite
                  ? 'border-[#E69A7E] bg-[#FCEAE3] text-[#BA4A2B]'
                  : 'border-[#D8D2C2] bg-[#FAF6EC] text-[#456354] hover:text-[#173326]'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Tersimpan di Favorit' : 'Simpan Favorit'}</span>
            </button>
          </div>

          {/* Synopsis */}
          <div className="mt-8 border-t border-[#EFEAE0] pt-6">
            <h2 className="text-base font-bold text-[#173326]">Ringkasan Buku</h2>
            <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-[#3E584A]">
              {book.synopsis}
            </p>
          </div>

          {/* Accession Metadata Grid */}
          <dl className="mt-8 divide-y divide-[#EFEAE0] border-y border-[#EFEAE0] text-sm">
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#456354]">Ketersediaan</dt>
              <dd className="col-span-2 font-mono font-medium tabular-nums text-[#173326]">
                {book.availableCopies} dari {book.totalCopies} eksemplar tersedia
              </dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#456354]">Penerbit & Tahun</dt>
              <dd className="col-span-2 text-[#173326]">
                {book.publisher} · <span className="font-mono tabular-nums">{book.year}</span>
              </dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#456354]">Nomor ISBN</dt>
              <dd className="col-span-2 font-mono tabular-nums text-[#173326]">{book.isbn}</dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#456354]">Jumlah Halaman</dt>
              <dd className="col-span-2 font-mono tabular-nums text-[#173326]">
                {book.pages} halaman ({book.language})
              </dd>
            </div>
            <div className="grid grid-cols-3 py-3">
              <dt className="text-[#456354]">Dukungan Aksesibilitas</dt>
              <dd className="col-span-2 text-[#173326]">
                {book.accessibilityFeatures.join(' · ')}
              </dd>
            </div>
          </dl>

          {/* Table of Contents */}
          <div className="mt-8">
            <h2 className="text-base font-bold text-[#173326]">
              Daftar Bab ({book.chapters.length} Bab)
            </h2>
            <div className="mt-3 divide-y divide-[#EFEAE0] rounded-2xl border border-[#E6E0D0] bg-[#FAF6EC]/60">
              {book.chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onReadBook(book, idx)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[#EFF7F0] cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#173326]">{chapter.title}</p>
                    <p className="mt-0.5 text-xs text-[#456354]">
                      Estimasi baca{' '}
                      <span className="font-mono tabular-nums">{chapter.estimatedMinutes}</span>{' '}
                      menit
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1F563E] whitespace-nowrap">
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
