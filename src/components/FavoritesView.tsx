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
      <div className="flex flex-col justify-between gap-4 border-b border-[#DFDDD2] pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[#1A2B22] sm:text-4xl">
            Daftar Favorit
          </h1>
          <p className="mt-2 text-base text-[#4A5D52]">
            Koleksi bacaan yang Anda simpan agar mudah ditemukan dan dibaca kembali kapan saja.
          </p>
        </div>

        {!currentUser && favoriteBooks.length > 0 && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-lg border border-[#214232] bg-[#EDF1EC] px-4 py-2.5 text-sm font-medium text-[#1A2B22] hover:bg-[#DCE5DC] whitespace-nowrap cursor-pointer"
          >
            Masuk untuk Simpan Permanen
          </button>
        )}
      </div>

      {favoriteBooks.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#DFDDD2] bg-[#FBF9F4] px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF1EC] text-[#214232]">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-editorial text-xl font-semibold text-[#1A2B22]">
            Daftar favorit Anda masih kosong
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#4A5D52]">
            Tekan tombol ikon hati pada buku di katalog untuk menyimpan bacaan yang ingin Anda
            kunjungi kembali nanti.
          </p>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="mt-6 rounded-lg bg-[#214232] px-5 py-2.5 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] cursor-pointer"
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
