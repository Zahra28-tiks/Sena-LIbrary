import { Heart } from 'lucide-react';
import { Book, PublicUser } from '../types/library.ts';
import { BookCard } from './BookCard.tsx';

interface FavoritesViewProps {
  currentUser: PublicUser | null;
  books: Book[];
  favorites: string[];
  activeLoanBookIds: Set<string>;
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
  onExploreCatalog: () => void;
  onOpenAuth: () => void;
}

export function FavoritesView({
  currentUser,
  books,
  favorites,
  activeLoanBookIds,
  onSelectBook,
  onReadBook,
  onToggleFavorite,
  onExploreCatalog,
  onOpenAuth,
}: FavoritesViewProps) {
  const favoriteBooks = books.filter((b) => favorites.includes(b.id));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E6E0D0] bg-gradient-to-r from-[#FCEAE3]/70 via-[#FFFDF7] to-[#EFF7F0] p-6 sm:flex-row sm:items-end sm:p-8">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-[#173326] sm:text-4xl">
            Daftar Favorit
          </h1>
          <p className="mt-2 text-base text-[#456354]">
            Simpan bacaan kesukaanmu agar selalu siap dibaca kembali kapan saja.
          </p>
        </div>

        {!currentUser && favoriteBooks.length > 0 && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-xl border border-[#ECD79A] bg-[#FDF1CC] px-4 py-2.5 text-sm font-semibold text-[#173326] hover:bg-[#FCE6A6] whitespace-nowrap cursor-pointer"
          >
            Masuk untuk Simpan Permanen
          </button>
        )}
      </div>

      {favoriteBooks.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#E6E0D0] bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCEAE3] text-[#BA4A2B]">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-editorial text-xl font-bold text-[#173326]">
            Daftar favoritmu masih kosong
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#456354]">
            Tekan ikon hati pada buku di katalog untuk menyimpan bacaan pilihan yang ingin kamu
            nikmati lagi nanti.
          </p>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="mt-6 rounded-xl bg-[#1F563E] px-5 py-2.5 text-sm font-semibold text-[#FFFDF7] hover:bg-[#17422F] cursor-pointer"
          >
            Jelajahi Katalog
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {favoriteBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={true}
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
