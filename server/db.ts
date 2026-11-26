import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  AdminMemberRow,
  AdminOverviewResponse,
  Book,
  Loan,
  PublicUser,
  ReadingPreferences,
} from '../src/types/library.ts';
import { SEED_BOOKS } from './seedBooks.ts';

export interface StoredUser extends PublicUser {
  passwordHash: string;
  salt: string;
}

interface LibraryDatabase {
  books: Book[];
  users: StoredUser[];
  loans: Loan[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'sena-library.json');

// Signing secret stays in process memory if SESSION_SECRET env var is absent
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const DEFAULT_PREFS: ReadingPreferences = {
  fontSize: 18,
  lineHeight: 1.85,
  theme: 'cream',
  fontFamily: 'serif',
  readingGuide: false,
};

let dbCache: LibraryDatabase | null = null;

function ensureDbLoaded(): LibraryDatabase {
  if (dbCache) {
    return dbCache;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<LibraryDatabase>;
      dbCache = {
        books: Array.isArray(parsed.books) && parsed.books.length > 0 ? parsed.books : [...SEED_BOOKS],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        loans: Array.isArray(parsed.loans) ? parsed.loans : [],
      };
      return dbCache;
    } catch {
      // Fall back to fresh seeded DB if file is corrupted
    }
  }

  dbCache = {
    books: [...SEED_BOOKS],
    users: [],
    loans: [],
  };
  persistDb(dbCache);
  return dbCache;
}

function persistDb(db: LibraryDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_PATH);
}

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash: derived, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: candidate } = hashPassword(password, salt);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    accessibilityPrefs: user.accessibilityPrefs || { ...DEFAULT_PREFS },
    favorites: Array.isArray(user.favorites) ? user.favorites : [],
    readingProgress: user.readingProgress || {},
    createdAt: user.createdAt,
  };
}

export function createSessionToken(user: { id: string; role: 'member' | 'admin' }): string {
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): { sub: string; role: 'member' | 'admin' } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as {
      sub: string;
      role: 'member' | 'admin';
      exp: number;
    };
    if (!decoded.sub || typeof decoded.exp !== 'number' || Date.now() > decoded.exp) {
      return null;
    }
    return { sub: decoded.sub, role: decoded.role };
  } catch {
    return null;
  }
}

export function getEnvAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || '').trim();
}

export function hasClaimedAdmin(): boolean {
  const db = ensureDbLoaded();
  return db.users.some((u) => u.role === 'admin');
}

export function getUserById(userId: string): StoredUser | undefined {
  const db = ensureDbLoaded();
  return db.users.find((u) => u.id === userId);
}

export function getUserByEmail(email: string): StoredUser | undefined {
  const db = ensureDbLoaded();
  const norm = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === norm);
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'member' | 'admin';
  accessibilityPrefs?: Partial<ReadingPreferences>;
}): PublicUser {
  const db = ensureDbLoaded();
  const normEmail = input.email.trim().toLowerCase();
  const { hash, salt } = hashPassword(input.password);
  const newUser: StoredUser = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    email: normEmail,
    passwordHash: hash,
    salt,
    role: input.role,
    status: 'active',
    accessibilityPrefs: {
      ...DEFAULT_PREFS,
      ...(input.accessibilityPrefs || {}),
    },
    favorites: [],
    readingProgress: {},
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  persistDb(db);
  return toPublicUser(newUser);
}

export function ensurePasscodeAdminUser(): StoredUser {
  const db = ensureDbLoaded();
  let admin = db.users.find((u) => u.id === 'usr-env-admin');
  if (!admin) {
    const randomSeed = crypto.randomBytes(32).toString('hex');
    const { hash, salt } = hashPassword(randomSeed);
    admin = {
      id: 'usr-env-admin',
      name: 'Administrator SENA',
      email: 'admin@senalibrary.id',
      passwordHash: hash,
      salt,
      role: 'admin',
      status: 'active',
      accessibilityPrefs: { ...DEFAULT_PREFS },
      favorites: [],
      readingProgress: {},
      createdAt: new Date().toISOString(),
    };
    db.users.push(admin);
    persistDb(db);
  }
  return admin;
}

export function updateUserPreferences(userId: string, prefs: Partial<ReadingPreferences>): PublicUser | null {
  const db = ensureDbLoaded();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.accessibilityPrefs = {
    ...user.accessibilityPrefs,
    ...prefs,
  };
  persistDb(db);
  return toPublicUser(user);
}

export function toggleFavorite(userId: string, bookId: string): { favorites: string[]; added: boolean } | null {
  const db = ensureDbLoaded();
  const user = db.users.find((u) => u.id === userId);
  const book = db.books.find((b) => b.id === bookId);
  if (!user || !book) return null;

  const idx = user.favorites.indexOf(bookId);
  let added = false;
  if (idx >= 0) {
    user.favorites.splice(idx, 1);
  } else {
    user.favorites.push(bookId);
    added = true;
  }
  persistDb(db);
  return { favorites: [...user.favorites], added };
}

export function listBooks(filters?: {
  q?: string;
  category?: string;
  availability?: string;
  accessibility?: string;
  sort?: string;
}): Book[] {
  const db = ensureDbLoaded();
  let results = [...db.books];

  if (filters?.q && filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.synopsis.toLowerCase().includes(q)
    );
  }

  if (filters?.category && filters.category !== 'Semua') {
    results = results.filter((b) => b.category === filters.category);
  }

  if (filters?.availability === 'available') {
    results = results.filter((b) => b.availableCopies > 0);
  } else if (filters?.availability === 'borrowed') {
    results = results.filter((b) => b.availableCopies === 0);
  }

  if (filters?.accessibility && filters.accessibility !== 'Semua') {
    results = results.filter((b) =>
      b.accessibilityFeatures.includes(filters.accessibility as Book['accessibilityFeatures'][number])
    );
  }

  if (filters?.sort === 'title-asc') {
    results.sort((a, b) => a.title.localeCompare(b.title, 'id'));
  } else if (filters?.sort === 'popular') {
    results.sort((a, b) => b.readCount - a.readCount);
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return results;
}

export function getBookById(bookId: string): Book | undefined {
  const db = ensureDbLoaded();
  return db.books.find((b) => b.id === bookId);
}

export function recordBookRead(bookId: string, userId?: string, chapterIndex?: number): Book | null {
  const db = ensureDbLoaded();
  const book = db.books.find((b) => b.id === bookId);
  if (!book) return null;

  if (typeof chapterIndex !== 'number') {
    book.readCount += 1;
  }

  if (userId && typeof chapterIndex === 'number') {
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      user.readingProgress[bookId] = {
        chapterIndex: Math.max(0, Math.min(chapterIndex, Math.max(0, book.chapters.length - 1))),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  persistDb(db);
  return book;
}

export function createBook(input: Omit<Book, 'id' | 'readCount' | 'createdAt'>): Book {
  const db = ensureDbLoaded();
  const book: Book = {
    ...input,
    id: `bk-${crypto.randomUUID().slice(0, 8)}`,
    readCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.books.unshift(book);
  persistDb(db);
  return book;
}

export function updateBook(bookId: string, patch: Partial<Book>): Book | null {
  const db = ensureDbLoaded();
  const idx = db.books.findIndex((b) => b.id === bookId);
  if (idx < 0) return null;

  const existing = db.books[idx];
  const nextTotal = typeof patch.totalCopies === 'number' ? Math.max(1, patch.totalCopies) : existing.totalCopies;
  const activeLoansForBook = db.loans.filter((l) => l.bookId === bookId && l.status === 'active').length;
  const nextAvailable =
    typeof patch.availableCopies === 'number'
      ? Math.max(0, Math.min(nextTotal - activeLoansForBook, patch.availableCopies))
      : Math.max(0, Math.min(nextTotal - activeLoansForBook, existing.availableCopies));

  const updated: Book = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    totalCopies: nextTotal,
    availableCopies: nextAvailable,
  };

  db.books[idx] = updated;
  persistDb(db);
  return updated;
}

export function deleteBook(bookId: string): { ok: boolean; error?: string } {
  const db = ensureDbLoaded();
  const hasActiveLoans = db.loans.some((l) => l.bookId === bookId && l.status === 'active');
  if (hasActiveLoans) {
    return { ok: false, error: 'Buku sedang dipinjam anggota. Selesaikan pengembalian terlebih dahulu.' };
  }
  const idx = db.books.findIndex((b) => b.id === bookId);
  if (idx < 0) {
    return { ok: false, error: 'Buku tidak ditemukan.' };
  }
  db.books.splice(idx, 1);
  // Clean up favorites references
  for (const user of db.users) {
    user.favorites = user.favorites.filter((fid) => fid !== bookId);
  }
  persistDb(db);
  return { ok: true };
}

export function getLoansForUser(userId: string): Loan[] {
  const db = ensureDbLoaded();
  return db.loans
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime());
}

export function borrowBook(userId: string, bookId: string): { ok: boolean; loan?: Loan; book?: Book; error?: string } {
  const db = ensureDbLoaded();
  const user = db.users.find((u) => u.id === userId);
  const book = db.books.find((b) => b.id === bookId);

  if (!user) return { ok: false, error: 'Akun anggota tidak ditemukan.' };
  if (user.status === 'suspended') return { ok: false, error: 'Akun Anda sedang ditangguhkan.' };
  if (!book) return { ok: false, error: 'Buku tidak ditemukan.' };
  if (book.availableCopies <= 0) {
    return { ok: false, error: 'Semua eksemplar buku ini sedang dipinjam.' };
  }

  const alreadyBorrowed = db.loans.some(
    (l) => l.userId === userId && l.bookId === bookId && l.status === 'active'
  );
  if (alreadyBorrowed) {
    return { ok: false, error: 'Anda masih memiliki peminjaman aktif untuk buku ini.' };
  }

  const now = new Date();
  const due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const loan: Loan = {
    id: `ln-${crypto.randomUUID().slice(0, 8)}`,
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookCoverUrl: book.coverUrl,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    borrowedAt: now.toISOString(),
    dueAt: due.toISOString(),
    status: 'active',
    renewCount: 0,
  };

  book.availableCopies = Math.max(0, book.availableCopies - 1);
  db.loans.unshift(loan);
  persistDb(db);
  return { ok: true, loan, book };
}

export function renewLoan(loanId: string, userId: string): { ok: boolean; loan?: Loan; error?: string } {
  const db = ensureDbLoaded();
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan) return { ok: false, error: 'Data peminjaman tidak ditemukan.' };
  if (loan.userId !== userId) return { ok: false, error: 'Anda tidak memiliki akses ke peminjaman ini.' };
  if (loan.status !== 'active') return { ok: false, error: 'Peminjaman sudah dikembalikan.' };
  if (loan.renewCount >= 2) return { ok: false, error: 'Batas perpanjangan maksimal (2 kali) telah tercapai.' };

  const currentDue = new Date(loan.dueAt);
  const extended = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);
  loan.dueAt = extended.toISOString();
  loan.renewCount += 1;
  persistDb(db);
  return { ok: true, loan };
}

export function returnLoan(
  loanId: string,
  actorId: string,
  actorRole: 'member' | 'admin'
): { ok: boolean; loan?: Loan; book?: Book; error?: string } {
  const db = ensureDbLoaded();
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan) return { ok: false, error: 'Data peminjaman tidak ditemukan.' };
  if (actorRole !== 'admin' && loan.userId !== actorId) {
    return { ok: false, error: 'Anda tidak memiliki akses untuk mengembalikan buku ini.' };
  }
  if (loan.status === 'returned') {
    return { ok: false, error: 'Buku ini sudah dikembalikan sebelumnya.' };
  }

  loan.status = 'returned';
  loan.returnedAt = new Date().toISOString();

  const book = db.books.find((b) => b.id === loan.bookId);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
  }

  persistDb(db);
  return { ok: true, loan, book };
}

export function getAdminOverview(): AdminOverviewResponse {
  const db = ensureDbLoaded();
  const members: AdminMemberRow[] = db.users
    .map((u) => {
      const userLoans = db.loans.filter((l) => l.userId === u.id);
      return {
        ...toPublicUser(u),
        activeLoansCount: userLoans.filter((l) => l.status === 'active').length,
        totalLoansCount: userLoans.length,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const loans = [...db.loans].sort(
    (a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
  );

  return {
    stats: {
      totalTitles: db.books.length,
      totalCopies: db.books.reduce((sum, b) => sum + b.totalCopies, 0),
      availableCopies: db.books.reduce((sum, b) => sum + b.availableCopies, 0),
      totalMembers: db.users.filter((u) => u.role === 'member').length,
      activeLoans: db.loans.filter((l) => l.status === 'active').length,
      totalReads: db.books.reduce((sum, b) => sum + b.readCount, 0),
    },
    members,
    loans,
  };
}

export function updateMemberByAdmin(
  targetUserId: string,
  actorUserId: string,
  patch: { status?: 'active' | 'suspended'; role?: 'member' | 'admin' }
): { ok: boolean; member?: PublicUser; error?: string } {
  const db = ensureDbLoaded();
  const target = db.users.find((u) => u.id === targetUserId);
  if (!target) return { ok: false, error: 'Anggota tidak ditemukan.' };
  if (target.id === actorUserId) {
    return { ok: false, error: 'Tidak dapat mengubah status atau peran akun Anda sendiri.' };
  }

  if (patch.status === 'active' || patch.status === 'suspended') {
    target.status = patch.status;
  }
  if (patch.role === 'member' || patch.role === 'admin') {
    target.role = patch.role;
  }

  persistDb(db);
  return { ok: true, member: toPublicUser(target) };
}
