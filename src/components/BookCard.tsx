import { BookOpen, Heart } from 'lucide-react';
import { Book } from '../types/library.ts';
import { BookCover } from './BookCover.tsx';

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  isBorrowedByUser: boolean;
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}

export function BookCard({
  book,
  isFavorite,
  isBorrowedByUser,
  onSelectBook,
  onReadBook,
  onToggleFavorite,
}: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#E6E0D0] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9CC0A4] hover:shadow-md">
      <div>
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => onSelectBook(book)}
            className="block w-full text-left cursor-pointer focus-visible:rounded-xl"
            aria-label={`Lihat detail buku ${book.title}`}
          >
            <BookCover book={book} className="aspect-[3/4] w-full rounded-xl" />
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(book.id)}
            aria-label={isFavorite ? `Hapus ${book.title} dari favorit` : `Simpan ${book.title} ke favorit`}
            aria-pressed={isFavorite}
            className={`absolute top-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              isFavorite
                ? 'border-[#E69A7E] bg-[#FCEAE3] text-[#BA4A2B]'
                : 'border-[#E6E0D0] bg-white/95 text-[#456354] hover:bg-[#FDF5DC] hover:text-[#173326]'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {/* Clean unboxed metadata (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#456354]">
          <span>{book.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{book.year}</span>
        </div>

        <h3 className="mt-1.5 font-editorial text-lg font-semibold leading-snug text-[#173326] line-clamp-2">
          <button
            type="button"
            onClick={() => onSelectBook(book)}
            className="text-left hover:text-[#1F563E] hover:underline cursor-pointer"
          >
            {book.title}
          </button>
        </h3>

        <p className="mt-1 text-sm text-[#456354] truncate">{book.author}</p>
      </div>

      <div className="mt-4 border-t border-[#EFEAE0] pt-3.5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span
            className={
              isBorrowedByUser
                ? 'font-semibold text-[#1F563E]'
                : isAvailable
                ? 'font-semibold text-[#236B48]'
                : 'font-semibold text-[#B4532A]'
            }
          >
            {isBorrowedByUser
              ? 'Sedang Anda pinjam'
              : isAvailable
              ? `Tersedia (${book.availableCopies} eks)`
              : 'Sedang dipinjam penuh'}
          </span>
          <span className="font-mono tabular-nums text-[#456354]">{book.pages} hlm</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReadBook(book)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1F563E] px-3 py-2 text-sm font-semibold text-[#FFFDF7] transition-colors hover:bg-[#17422F] whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Baca</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectBook(book)}
            className="rounded-xl border border-[#D8D2C2] bg-[#FAF6EC] px-3.5 py-2 text-sm font-medium text-[#173326] transition-colors hover:bg-[#FDF1CC] whitespace-nowrap cursor-pointer"
          >
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}
