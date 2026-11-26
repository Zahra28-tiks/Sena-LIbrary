import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Book } from '../types/library.ts';

interface BookCoverProps {
  book: Pick<Book, 'title' | 'author' | 'coverUrl' | 'coverTone'>;
  className?: string;
}

const TONE_BACKGROUNDS: Record<Book['coverTone'], string> = {
  'cream-sage': 'from-[#F4EFE4] via-[#E5ECE4] to-[#D2DFD3]',
  'forest-linen': 'from-[#EAE6DA] via-[#D8E2D9] to-[#274636]/15',
  'sand-botanical': 'from-[#F7F2E7] via-[#E6EBDF] to-[#C8D6C7]',
  'mist-editorial': 'from-[#F1EFE9] via-[#DEE5DE] to-[#BFCFBE]',
};

export function BookCover({ book, className = '' }: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !book.coverUrl) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden rounded-lg border border-[#D8DCD4] bg-gradient-to-br ${
          TONE_BACKGROUNDS[book.coverTone] || TONE_BACKGROUNDS['cream-sage']
        } p-4 text-[#1A2B22] ${className}`}
        aria-label={`Sampul buku ${book.title}`}
      >
        <div className="flex items-center justify-between text-[#4A5D52]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider">SENA</span>
        </div>
        <div className="my-auto py-3">
          <p className="font-editorial text-base font-semibold leading-snug text-[#1A2B22] line-clamp-3">
            {book.title}
          </p>
        </div>
        <p className="truncate text-xs text-[#4A5D52]">{book.author}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[#DFDDD2] bg-[#F0ECE1] ${className}`}
    >
      <img
        src={book.coverUrl}
        alt={`Sampul buku ${book.title} oleh ${book.author}`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}
