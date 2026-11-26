import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  borrowLibraryBook,
  fetchBookById,
  fetchBooks,
  fetchUserLoans,
  recordBookRead,
  renewLibraryLoan,
  returnLibraryLoan,
  setAuthToken,
  setUnauthorizedHandler,
  toggleFavoriteBook,
  updateReadingPreferences,
} from './api/client.ts';
import { AdminView } from './components/AdminView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BookDetailView } from './components/BookDetailView.tsx';
import { CatalogView } from './components/CatalogView.tsx';
import { DigitalReader } from './components/DigitalReader.tsx';
import { FavoritesView } from './components/FavoritesView.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './components/HomeView.tsx';
import { LoansView } from './components/LoansView.tsx';
import { Navbar, NavView } from './components/Navbar.tsx';
import {
  AccessibilityFeature,
  Book,
  BookCategory,
  Loan,
  PublicUser,
  ReadingPreferences,
} from './types/library.ts';

const DEFAULT_READER_PREFS: ReadingPreferences = {
  fontSize: 18,
  lineHeight: 1.85,
  theme: 'cream',
  fontFamily: 'serif',
  readingGuide: false,
};

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('home');
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'Semua'>('Semua');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [accessibilityFilter, setAccessibilityFilter] = useState<AccessibilityFeature | 'Semua'>('Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'title-asc' | 'popular'>('newest');

  // Detail & Reader state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readerState, setReaderState] = useState<{ book: Book; chapterIndex: number } | null>(null);

  // Auth, Favorites, Loans, Preferences
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [guestFavorites, setGuestFavorites] = useState<string[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [readerPrefs, setReaderPrefs] = useState<ReadingPreferences>(DEFAULT_READER_PREFS);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Action pending states & quiet notification
  const [detailActionPending, setDetailActionPending] = useState(false);
  const [loanActionPendingId, setLoanActionPendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      setCurrentUser(null);
      setLoans([]);
      notify('Sesi Anda telah berakhir. Silakan masuk kembali.');
    });
    return () => setUnauthorizedHandler(null);
  }, [notify]);

  const loadAllBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const list = await fetchBooks();
      setBooks(list);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal memuat koleksi buku.');
    } finally {
      setBooksLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadAllBooks();
  }, [loadAllBooks]);

  // Filtered catalog list (client-side instant responsiveness over fresh server list)
  const filteredBooks = useMemo(() => {
    let list = [...books];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.synopsis.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'Semua') {
      list = list.filter((b) => b.category === selectedCategory);
    }
    if (availabilityFilter === 'available') {
      list = list.filter((b) => b.availableCopies > 0);
    } else if (availabilityFilter === 'borrowed') {
      list = list.filter((b) => b.availableCopies === 0);
    }
    if (accessibilityFilter !== 'Semua') {
      list = list.filter((b) => b.accessibilityFeatures.includes(accessibilityFilter));
    }
    if (sortBy === 'title-asc') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'id'));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => b.readCount - a.readCount);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [books, searchQuery, selectedCategory, availabilityFilter, accessibilityFilter, sortBy]);

  const favorites = currentUser ? currentUser.favorites : guestFavorites;

  const activeLoanBookIds = useMemo(() => {
    return new Set(loans.filter((l) => l.status === 'active').map((l) => l.bookId));
  }, [loans]);

  const handleAuthSuccess = async (user: PublicUser) => {
    setCurrentUser(user);
    setReaderPrefs(user.accessibilityPrefs || DEFAULT_READER_PREFS);
    try {
      const userLoans = await fetchUserLoans();
      setLoans(userLoans);
    } catch {
      setLoans([]);
    }
    notify(`Selamat datang, ${user.name}.`);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setLoans([]);
    if (activeView === 'admin') {
      setActiveView('home');
    }
    notify('Anda telah keluar dari akun.');
  };

  const handleNavigate = (view: NavView) => {
    setSelectedBook(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCatalogWithCategory = (category?: BookCategory | 'Semua') => {
    if (category) {
      setSelectedCategory(category);
    }
    setSelectedBook(null);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = async (book: Book) => {
    setSelectedBook(book);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const fresh = await fetchBookById(book.id);
      setSelectedBook(fresh);
    } catch {
      // Keep local object if refresh fails
    }
  };

  const handleOpenReader = async (book: Book, chapterIndex?: number) => {
    const savedChapter = currentUser?.readingProgress?.[book.id]?.chapterIndex ?? 0;
    const startIndex = typeof chapterIndex === 'number' ? chapterIndex : savedChapter;
    setReaderState({ book, chapterIndex: startIndex });
    try {
      await recordBookRead(book.id);
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, readCount: b.readCount + 1 } : b))
      );
    } catch {
      // Non-blocking read count increment
    }
  };

  const handleSaveReaderProgress = useCallback(
    async (bookId: string, chapterIndex: number) => {
      if (!currentUser) return;
      try {
        await recordBookRead(bookId, chapterIndex);
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                readingProgress: {
                  ...prev.readingProgress,
                  [bookId]: { chapterIndex, updatedAt: new Date().toISOString() },
                },
              }
            : null
        );
      } catch {
        // Non-blocking
      }
    },
    [currentUser]
  );

  const handleUpdateReaderPrefs = async (next: ReadingPreferences) => {
    setReaderPrefs(next);
    if (currentUser) {
      try {
        const res = await updateReadingPreferences(next);
        setCurrentUser(res.user);
      } catch {
        // Non-blocking
      }
    }
  };

  const handleToggleFavorite = async (bookId: string) => {
    if (!currentUser) {
      setGuestFavorites((prev) => {
        const exists = prev.includes(bookId);
        notify(
          exists
            ? 'Buku dihapus dari daftar favorit sementara.'
            : 'Buku disimpan ke favorit sementara. Masuk akun untuk menyimpannya permanen.'
        );
        return exists ? prev.filter((id) => id !== bookId) : [...prev, bookId];
      });
      return;
    }

    try {
      const res = await toggleFavoriteBook(bookId);
      setCurrentUser((prev) => (prev ? { ...prev, favorites: res.favorites } : null));
      notify(res.added ? 'Buku ditambahkan ke Daftar Favorit.' : 'Buku dihapus dari Daftar Favorit.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal memperbarui favorit.');
    }
  };

  const handleBorrowBook = async (bookId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      notify('Silakan masuk atau daftar anggota terlebih dahulu untuk meminjam buku.');
      return;
    }

    setDetailActionPending(true);
    try {
      const res = await borrowLibraryBook(bookId);
      setLoans((prev) => [res.loan, ...prev]);
      setBooks((prev) => prev.map((b) => (b.id === res.book.id ? res.book : b)));
      if (selectedBook?.id === res.book.id) {
        setSelectedBook(res.book);
      }
      notify(`Berhasil meminjam "${res.book.title}" selama 7 hari.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal meminjam buku.');
    } finally {
      setDetailActionPending(false);
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    setLoanActionPendingId(loanId);
    try {
      const res = await renewLibraryLoan(loanId);
      setLoans((prev) => prev.map((l) => (l.id === res.loan.id ? res.loan : l)));
      notify('Masa peminjaman berhasil diperpanjang 7 hari.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal memperpanjang peminjaman.');
    } finally {
      setLoanActionPendingId(null);
    }
  };

  const handleReturnLoan = async (loanId: string) => {
    setDetailActionPending(true);
    setLoanActionPendingId(loanId);
    try {
      const res = await returnLibraryLoan(loanId);
      setLoans((prev) => prev.map((l) => (l.id === res.loan.id ? res.loan : l)));
      if (res.book) {
        setBooks((prev) => prev.map((b) => (b.id === res.book!.id ? res.book! : b)));
        if (selectedBook?.id === res.book.id) {
          setSelectedBook(res.book);
        }
      }
      notify('Terima kasih, buku telah berhasil dikembalikan.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengembalikan buku.');
    } finally {
      setDetailActionPending(false);
      setLoanActionPendingId(null);
    }
  };

  // Full-screen distraction-free Digital Reader
  if (readerState) {
    return (
      <DigitalReader
        book={readerState.book}
        initialChapterIndex={readerState.chapterIndex}
        preferences={readerPrefs}
        onUpdatePreferences={handleUpdateReaderPrefs}
        onSaveProgress={handleSaveReaderProgress}
        onClose={() => setReaderState(null)}
      />
    );
  }

  const activeLoanForSelected = selectedBook
    ? loans.find((l) => l.bookId === selectedBook.id && l.status === 'active')
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7] text-[#173326]">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {selectedBook ? (
          <BookDetailView
            book={selectedBook}
            isFavorite={favorites.includes(selectedBook.id)}
            activeLoan={activeLoanForSelected}
            actionPending={detailActionPending}
            onBack={() => setSelectedBook(null)}
            onReadBook={handleOpenReader}
            onBorrowBook={handleBorrowBook}
            onReturnLoan={handleReturnLoan}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : activeView === 'home' ? (
          <HomeView
            books={books}
            favorites={favorites}
            activeLoanBookIds={activeLoanBookIds}
            onNavigateCatalog={handleNavigateCatalogWithCategory}
            onSelectBook={handleSelectBook}
            onReadBook={(book) => handleOpenReader(book)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : activeView === 'catalog' ? (
          <CatalogView
            books={filteredBooks}
            loading={booksLoading}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            availabilityFilter={availabilityFilter}
            accessibilityFilter={accessibilityFilter}
            sortBy={sortBy}
            favorites={favorites}
            activeLoanBookIds={activeLoanBookIds}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onAvailabilityChange={setAvailabilityFilter}
            onAccessibilityChange={setAccessibilityFilter}
            onSortChange={setSortBy}
            onResetFilters={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setAvailabilityFilter('all');
              setAccessibilityFilter('Semua');
              setSortBy('newest');
            }}
            onSelectBook={handleSelectBook}
            onReadBook={(book) => handleOpenReader(book)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : activeView === 'favorites' ? (
          <FavoritesView
            currentUser={currentUser}
            books={books}
            favorites={favorites}
            activeLoanBookIds={activeLoanBookIds}
            onSelectBook={handleSelectBook}
            onReadBook={(book) => handleOpenReader(book)}
            onToggleFavorite={handleToggleFavorite}
            onExploreCatalog={() => handleNavigate('catalog')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        ) : activeView === 'loans' ? (
          <LoansView
            currentUser={currentUser}
            loans={loans}
            books={books}
            actionPendingId={loanActionPendingId}
            onOpenAuth={() => setAuthModalOpen(true)}
            onExploreCatalog={() => handleNavigate('catalog')}
            onReadBook={(book) => handleOpenReader(book)}
            onRenewLoan={handleRenewLoan}
            onReturnLoan={handleReturnLoan}
          />
        ) : (
          <AdminView
            currentUser={currentUser}
            books={books}
            onAdminAuthenticated={handleAuthSuccess}
            onBooksChanged={loadAllBooks}
            onNotify={notify}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Cheerful Accessible Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-[#1F563E] bg-[#1F563E] px-4 py-3 text-sm font-medium text-[#FFFDF7] shadow-lg"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup pemberitahuan"
            className="rounded-lg p-1 hover:bg-white/15 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
