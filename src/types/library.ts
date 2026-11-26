export type BookCategory =
  | 'Sastra & Fiksi'
  | 'Sains & Ekologi'
  | 'Sejarah & Budaya'
  | 'Pendidikan & Inklusi'
  | 'Pengembangan Diri'
  | 'Cerita Anak & Remaja';

export type AccessibilityFeature =
  | 'Ramah Disleksia'
  | 'Teks Besar'
  | 'Struktur Bab Jelas'
  | 'Ringkasan Suara';

export interface BookChapter {
  id: string;
  title: string;
  estimatedMinutes: number;
  paragraphs: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  year: number;
  isbn: string;
  publisher: string;
  language: string;
  pages: number;
  totalCopies: number;
  availableCopies: number;
  coverUrl: string;
  coverTone: 'cream-sage' | 'forest-linen' | 'sand-botanical' | 'mist-editorial';
  accessibilityFeatures: AccessibilityFeature[];
  synopsis: string;
  featured: boolean;
  readCount: number;
  chapters: BookChapter[];
  createdAt: string;
}

export interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  theme: 'cream' | 'white' | 'dark-sage';
  fontFamily: 'serif' | 'sans';
  readingGuide: boolean;
}

export interface ReadingProgress {
  chapterIndex: number;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  status: 'active' | 'suspended';
  accessibilityPrefs: ReadingPreferences;
  favorites: string[];
  readingProgress: Record<string, ReadingProgress>;
  createdAt: string;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  userId: string;
  userName: string;
  userEmail: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: 'active' | 'returned';
  renewCount: number;
}

export interface AdminMemberRow extends PublicUser {
  activeLoansCount: number;
  totalLoansCount: number;
}

export interface AdminOverviewResponse {
  stats: {
    totalTitles: number;
    totalCopies: number;
    availableCopies: number;
    totalMembers: number;
    activeLoans: number;
    totalReads: number;
  };
  members: AdminMemberRow[];
  loans: Loan[];
}
