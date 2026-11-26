import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  borrowBook,
  createBook,
  createSessionToken,
  createUser,
  deleteBook,
  ensurePasscodeAdminUser,
  getAdminOverview,
  getBookById,
  getEnvAdminPasscode,
  getLoansForUser,
  getUserByEmail,
  getUserById,
  hasClaimedAdmin,
  listBooks,
  recordBookRead,
  renewLoan,
  returnLoan,
  toPublicUser,
  toggleFavorite,
  updateBook,
  updateMemberByAdmin,
  updateUserPreferences,
  verifyPassword,
  verifySessionToken,
} from './server/db.ts';
import { AccessibilityFeature, BookCategory, PublicUser } from './src/types/library.ts';

dotenv.config();

interface AuthenticatedRequest extends Request {
  authUser?: PublicUser;
}

const VALID_CATEGORIES: BookCategory[] = [
  'Sastra & Fiksi',
  'Sains & Ekologi',
  'Sejarah & Budaya',
  'Pendidikan & Inklusi',
  'Pengembangan Diri',
  'Cerita Anak & Remaja',
];

const VALID_ACCESSIBILITY: AccessibilityFeature[] = [
  'Ramah Disleksia',
  'Teks Besar',
  'Struktur Bab Jelas',
  'Ringkasan Suara',
];

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function attachAuthIfPresent(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (token) {
    const claims = verifySessionToken(token);
    if (claims) {
      const user = getUserById(claims.sub);
      if (user && user.status === 'active') {
        req.authUser = toPublicUser(user);
      }
    }
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Silakan masuk terlebih dahulu untuk mengakses fitur ini.' });
    return;
  }
  const claims = verifySessionToken(token);
  if (!claims) {
    res.status(401).json({ error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' });
    return;
  }
  const user = getUserById(claims.sub);
  if (!user) {
    res.status(401).json({ error: 'Akun tidak ditemukan.' });
    return;
  }
  if (user.status === 'suspended') {
    res.status(403).json({ error: 'Akun anggota ini sedang ditangguhkan oleh administrator.' });
    return;
  }
  req.authUser = toPublicUser(user);
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.authUser?.role !== 'admin') {
      res.status(403).json({ error: 'Akses khusus administrator.' });
      return;
    }
    next();
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCoverUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/src/assets/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // --- Health ---
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // --- Auth Routes ---
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, accessibilityPrefs } = req.body ?? {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
      res.status(400).json({ error: 'Nama lengkap minimal 2 karakter dan maksimal 80 karakter.' });
      return;
    }
    if (typeof email !== 'string' || !isValidEmail(email.trim())) {
      res.status(400).json({ error: 'Format alamat email tidak valid.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
      res.status(400).json({ error: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    if (getUserByEmail(email)) {
      res.status(409).json({ error: 'Alamat email ini sudah terdaftar. Silakan masuk.' });
      return;
    }

    const user = createUser({
      name,
      email,
      password,
      role: 'member',
      accessibilityPrefs: typeof accessibilityPrefs === 'object' ? accessibilityPrefs : undefined,
    });
    const token = createSessionToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      res.status(400).json({ error: 'Masukkan email dan kata sandi Anda.' });
      return;
    }

    const user = getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Akun anggota ini sedang ditangguhkan. Hubungi administrator.' });
      return;
    }

    const token = createSessionToken({ id: user.id, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const loans = getLoansForUser(req.authUser!.id);
    res.json({ user: req.authUser, loans });
  });

  app.patch('/api/auth/preferences', requireAuth, (req: AuthenticatedRequest, res) => {
    const { fontSize, lineHeight, theme, fontFamily, readingGuide } = req.body ?? {};
    const sanitized: Record<string, unknown> = {};
    if (typeof fontSize === 'number' && fontSize >= 14 && fontSize <= 28) sanitized.fontSize = fontSize;
    if (typeof lineHeight === 'number' && lineHeight >= 1.4 && lineHeight <= 2.4) sanitized.lineHeight = lineHeight;
    if (theme === 'cream' || theme === 'white' || theme === 'dark-sage') sanitized.theme = theme;
    if (fontFamily === 'serif' || fontFamily === 'sans') sanitized.fontFamily = fontFamily;
    if (typeof readingGuide === 'boolean') sanitized.readingGuide = readingGuide;

    const updated = updateUserPreferences(req.authUser!.id, sanitized);
    if (!updated) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }
    res.json({ user: updated });
  });

  // --- Admin Bootstrap & Passcode Auth ---
  app.get('/api/admin/bootstrap-status', (_req, res) => {
    const envPasscode = getEnvAdminPasscode();
    const envPasscodeConfigured = envPasscode.length > 0;
    const adminExists = hasClaimedAdmin();
    res.json({
      envPasscodeConfigured,
      adminClaimed: adminExists,
      needsInitialClaim: !envPasscodeConfigured && !adminExists,
    });
  });

  app.post('/api/admin/claim', (req, res) => {
    const envPasscode = getEnvAdminPasscode();
    if (envPasscode.length > 0 || hasClaimedAdmin()) {
      res.status(409).json({ error: 'Akun administrator sudah diaktifkan sebelumnya.' });
      return;
    }

    const { name, email, password } = req.body ?? {};
    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Nama administrator minimal 2 karakter.' });
      return;
    }
    if (typeof email !== 'string' || !isValidEmail(email.trim())) {
      res.status(400).json({ error: 'Masukkan alamat email administrator yang valid.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Kata sandi administrator minimal 6 karakter.' });
      return;
    }
    if (getUserByEmail(email)) {
      res.status(409).json({ error: 'Email sudah digunakan oleh akun lain.' });
      return;
    }

    const admin = createUser({ name, email, password, role: 'admin' });
    const token = createSessionToken({ id: admin.id, role: 'admin' });
    res.status(201).json({ token, user: admin });
  });

  app.post('/api/admin/passcode-login', (req, res) => {
    const expected = getEnvAdminPasscode();
    if (!expected) {
      res.status(400).json({ error: 'Passcode lingkungan belum dikonfigurasi.' });
      return;
    }
    const { passcode } = req.body ?? {};
    if (typeof passcode !== 'string' || !passcode) {
      res.status(400).json({ error: 'Masukkan passcode administrator.' });
      return;
    }

    const a = Buffer.from(passcode);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      res.status(401).json({ error: 'Passcode administrator tidak sesuai.' });
      return;
    }

    const adminUser = ensurePasscodeAdminUser();
    const token = createSessionToken({ id: adminUser.id, role: 'admin' });
    res.json({ token, user: toPublicUser(adminUser) });
  });

  // --- Books & Catalog ---
  app.get('/api/books', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const availability = typeof req.query.availability === 'string' ? req.query.availability : undefined;
    const accessibility = typeof req.query.accessibility === 'string' ? req.query.accessibility : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;

    const books = listBooks({ q, category, availability, accessibility, sort });
    res.json({ books });
  });

  app.get('/api/books/:id', (req, res) => {
    const book = getBookById(req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Buku tidak ditemukan dalam katalog.' });
      return;
    }
    res.json({ book });
  });

  app.post('/api/books/:id/read', attachAuthIfPresent, (req: AuthenticatedRequest, res) => {
    const chapterIndex =
      typeof req.body?.chapterIndex === 'number' ? req.body.chapterIndex : undefined;
    const book = recordBookRead(req.params.id, req.authUser?.id, chapterIndex);
    if (!book) {
      res.status(404).json({ error: 'Buku tidak ditemukan.' });
      return;
    }
    res.json({ ok: true, readCount: book.readCount });
  });

  // --- Admin Book CRUD ---
  app.post('/api/books', requireAdmin, (req: AuthenticatedRequest, res) => {
    const {
      title,
      author,
      category,
      year,
      isbn,
      publisher,
      language,
      pages,
      totalCopies,
      coverUrl,
      coverTone,
      accessibilityFeatures,
      synopsis,
      featured,
      chapters,
    } = req.body ?? {};

    if (typeof title !== 'string' || title.trim().length < 2) {
      res.status(400).json({ error: 'Judul buku wajib diisi (minimal 2 karakter).' });
      return;
    }
    if (typeof author !== 'string' || author.trim().length < 2) {
      res.status(400).json({ error: 'Nama penulis wajib diisi.' });
      return;
    }
    const safeCategory: BookCategory = VALID_CATEGORIES.includes(category)
      ? category
      : 'Pendidikan & Inklusi';
    const safeYear = typeof year === 'number' && year >= 1900 && year <= 2100 ? year : 2026;
    const safePages = typeof pages === 'number' && pages >= 1 ? pages : 120;
    const safeCopies = typeof totalCopies === 'number' && totalCopies >= 1 ? Math.min(totalCopies, 200) : 3;
    const safeCover =
      typeof coverUrl === 'string' && isValidCoverUrl(coverUrl)
        ? coverUrl
        : '/src/assets/images/cover_jejak_aksara_1795659418063.jpg';

    const safeFeatures: AccessibilityFeature[] = Array.isArray(accessibilityFeatures)
      ? accessibilityFeatures.filter((f: AccessibilityFeature) => VALID_ACCESSIBILITY.includes(f))
      : ['Teks Besar', 'Struktur Bab Jelas'];

    const safeChapters =
      Array.isArray(chapters) && chapters.length > 0
        ? chapters.map((ch: { title?: string; paragraphs?: string[] }, idx: number) => ({
            id: `ch-${idx + 1}`,
            title: typeof ch.title === 'string' && ch.title.trim() ? ch.title.trim() : `Bab ${idx + 1}`,
            estimatedMinutes: 3,
            paragraphs:
              Array.isArray(ch.paragraphs) && ch.paragraphs.length > 0
                ? ch.paragraphs.filter((p) => typeof p === 'string' && p.trim().length > 0)
                : [typeof synopsis === 'string' && synopsis.trim() ? synopsis.trim() : 'Isi bab tersedia untuk dibaca.'],
          }))
        : [
            {
              id: 'ch-1',
              title: 'Bab 1: Pengantar',
              estimatedMinutes: 3,
              paragraphs: [
                typeof synopsis === 'string' && synopsis.trim()
                  ? synopsis.trim()
                  : 'Buku ini telah ditambahkan ke koleksi digital SENA LIBRARY dan siap diakses oleh seluruh anggota.',
              ],
            },
          ];

    const created = createBook({
      title: title.trim(),
      author: author.trim(),
      category: safeCategory,
      year: safeYear,
      isbn: typeof isbn === 'string' && isbn.trim() ? isbn.trim() : `978-623-${Math.floor(100000 + Math.random() * 899999)}`,
      publisher: typeof publisher === 'string' && publisher.trim() ? publisher.trim() : 'Pustaka Sena',
      language: typeof language === 'string' && language.trim() ? language.trim() : 'Bahasa Indonesia',
      pages: safePages,
      totalCopies: safeCopies,
      availableCopies: safeCopies,
      coverUrl: safeCover,
      coverTone:
        coverTone === 'cream-sage' ||
        coverTone === 'forest-linen' ||
        coverTone === 'sand-botanical' ||
        coverTone === 'mist-editorial'
          ? coverTone
          : 'cream-sage',
      accessibilityFeatures: safeFeatures.length > 0 ? safeFeatures : ['Teks Besar'],
      synopsis:
        typeof synopsis === 'string' && synopsis.trim()
          ? synopsis.trim()
          : 'Koleksi bacaan digital inklusif di SENA LIBRARY.',
      featured: Boolean(featured),
      chapters: safeChapters,
    });

    res.status(201).json({ book: created });
  });

  app.patch('/api/books/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const body = req.body ?? {};
    const patch: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim()) patch.title = body.title.trim();
    if (typeof body.author === 'string' && body.author.trim()) patch.author = body.author.trim();
    if (VALID_CATEGORIES.includes(body.category)) patch.category = body.category;
    if (typeof body.year === 'number' && body.year >= 1900 && body.year <= 2100) patch.year = body.year;
    if (typeof body.isbn === 'string' && body.isbn.trim()) patch.isbn = body.isbn.trim();
    if (typeof body.publisher === 'string' && body.publisher.trim()) patch.publisher = body.publisher.trim();
    if (typeof body.pages === 'number' && body.pages >= 1) patch.pages = body.pages;
    if (typeof body.totalCopies === 'number' && body.totalCopies >= 1) patch.totalCopies = body.totalCopies;
    if (typeof body.synopsis === 'string' && body.synopsis.trim()) patch.synopsis = body.synopsis.trim();
    if (typeof body.featured === 'boolean') patch.featured = body.featured;
    if (typeof body.coverUrl === 'string' && isValidCoverUrl(body.coverUrl)) patch.coverUrl = body.coverUrl;
    if (Array.isArray(body.accessibilityFeatures)) {
      patch.accessibilityFeatures = body.accessibilityFeatures.filter((f: AccessibilityFeature) =>
        VALID_ACCESSIBILITY.includes(f)
      );
    }

    const updated = updateBook(req.params.id, patch);
    if (!updated) {
      res.status(404).json({ error: 'Buku tidak ditemukan.' });
      return;
    }
    res.json({ book: updated });
  });

  app.delete('/api/books/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const result = deleteBook(req.params.id);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  });

  // --- Favorites & Loans ---
  app.post('/api/favorites/:bookId', requireAuth, (req: AuthenticatedRequest, res) => {
    const result = toggleFavorite(req.authUser!.id, req.params.bookId);
    if (!result) {
      res.status(404).json({ error: 'Buku atau pengguna tidak ditemukan.' });
      return;
    }
    res.json(result);
  });

  app.get('/api/loans', requireAuth, (req: AuthenticatedRequest, res) => {
    const loans = getLoansForUser(req.authUser!.id);
    res.json({ loans });
  });

  app.post('/api/loans', requireAuth, (req: AuthenticatedRequest, res) => {
    const { bookId } = req.body ?? {};
    if (typeof bookId !== 'string' || !bookId) {
      res.status(400).json({ error: 'ID buku wajib disertakan.' });
      return;
    }
    const result = borrowBook(req.authUser!.id, bookId);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json({ loan: result.loan, book: result.book });
  });

  app.post('/api/loans/:id/renew', requireAuth, (req: AuthenticatedRequest, res) => {
    const result = renewLoan(req.params.id, req.authUser!.id);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ loan: result.loan });
  });

  app.post('/api/loans/:id/return', requireAuth, (req: AuthenticatedRequest, res) => {
    const result = returnLoan(req.params.id, req.authUser!.id, req.authUser!.role);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ loan: result.loan, book: result.book });
  });

  // --- Admin Overview & Member Management ---
  app.get('/api/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res) => {
    res.json(getAdminOverview());
  });

  app.patch('/api/admin/members/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const { status, role } = req.body ?? {};
    const result = updateMemberByAdmin(req.params.id, req.authUser!.id, { status, role });
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ member: result.member });
  });

  // --- Vite / Static Serving ---
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Not found');
      }
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SENA LIBRARY server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SENA LIBRARY server:', err);
  process.exit(1);
});
