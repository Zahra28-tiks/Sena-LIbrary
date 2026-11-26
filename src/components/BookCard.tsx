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
    <article className="group flex flex-col justify-between rounded-xl border border-[#DFDDD2] bg-[#FBF9F4] p-4 transition-colors hover:border-[#B8C4B6]">
      <div>
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => onSelectBook(book)}
            className="block w-full text-left cursor-pointer focus-visible:rounded-lg"
            aria-label={`Lihat detail buku ${book.title}`}
          >
            <BookCover book={book} className="aspect-[3/4] w-full" />
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(book.id)}
            aria-label={isFavorite ? `Hapus ${book.title} dari favorit` : `Simpan ${book.title} ke favorit`}
            aria-pressed={isFavorite}
            className={`absolute top-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              isFavorite
                ? 'border-[#214232] bg-[#214232] text-[#FBF9F4]'
                : 'border-[#DFDDD2] bg-[#FBF9F4]/95 text-[#4A5D52] hover:text-[#1A2B22]'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {/* Clean unboxed metadata (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#4A5D52]">
          <span>{book.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{book.year}</span>
        </div>

        <h3 className="mt-1.5 font-editorial text-lg font-semibold leading-snug text-[#1A2B22] line-clamp-2">
          <button
            type="button"
            onClick={() => onSelectBook(book)}
            className="text-left hover:underline cursor-pointer"
          >
            {book.title}
          </button>
        </h3>

        <p className="mt-1 text-sm text-[#4A5D52] truncate">{book.author}</p>
      </div>

      <div className="mt-4 border-t border-[#E8E4D9] pt-3.5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className={isAvailable ? 'font-medium text-[#214232]' : 'font-medium text-[#8C4A32]'}>
            {isBorrowedByUser
              ? 'Sedang Anda pinjam'
              : isAvailable
              ? `Tersedia (${book.availableCopies} eks)`
              : 'Sedang dipinjam penuh'}
          </span>
          <span className="font-mono tabular-nums text-[#4A5D52]">{book.pages} hlm</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReadBook(book)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#214232] px-3 py-2 text-sm font-medium text-[#FBF9F4] transition-colors hover:bg-[#183326] whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Baca</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectBook(book)}
            className="rounded-lg border border-[#CBD3CA] bg-transparent px-3.5 py-2 text-sm font-medium text-[#1A2B22] transition-colors hover:bg-[#EDF1EC] whitespace-nowrap cursor-pointer"
          >
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}
