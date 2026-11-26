import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Minus,
  Plus,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Book, ReadingPreferences } from '../types/library.ts';

interface DigitalReaderProps {
  book: Book;
  initialChapterIndex?: number;
  preferences: ReadingPreferences;
  onUpdatePreferences: (next: ReadingPreferences) => void;
  onSaveProgress: (bookId: string, chapterIndex: number) => void;
  onClose: () => void;
}

const THEME_STYLES: Record<
  ReadingPreferences['theme'],
  { bg: string; surface: string; text: string; muted: string; border: string; highlight: string }
> = {
  cream: {
    bg: 'bg-[#F8F5EE]',
    surface: 'bg-[#FBF9F4]',
    text: 'text-[#1A2B22]',
    muted: 'text-[#4A5D52]',
    border: 'border-[#DFDDD2]',
    highlight: 'bg-[#E9EFE7]',
  },
  white: {
    bg: 'bg-[#FFFFFF]',
    surface: 'bg-[#F8FAF8]',
    text: 'text-[#17231C]',
    muted: 'text-[#4A5D52]',
    border: 'border-[#E2E5E2]',
    highlight: 'bg-[#EEF3EE]',
  },
  'dark-sage': {
    bg: 'bg-[#192820]',
    surface: 'bg-[#21342A]',
    text: 'text-[#EDF2EC]',
    muted: 'text-[#B5C6B8]',
    border: 'border-[#314A3C]',
    highlight: 'bg-[#294034]',
  },
};

export function DigitalReader({
  book,
  initialChapterIndex = 0,
  preferences,
  onUpdatePreferences,
  onSaveProgress,
  onClose,
}: DigitalReaderProps) {
  const safeInitial = Math.max(0, Math.min(initialChapterIndex, Math.max(0, book.chapters.length - 1)));
  const [chapterIndex, setChapterIndex] = useState(safeInitial);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusedParagraph, setFocusedParagraph] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const currentChapter = book.chapters[chapterIndex] || book.chapters[0];
  const theme = THEME_STYLES[preferences.theme] || THEME_STYLES.cream;

  const progressPercent =
    book.chapters.length > 0
      ? Math.round(((chapterIndex + 1) / book.chapters.length) * 100)
      : 100;

  useEffect(() => {
    onSaveProgress(book.id, chapterIndex);
  }, [book.id, chapterIndex, onSaveProgress]);

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  const stopSpeech = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleSpeech = () => {
    if (!speechSupported || !currentChapter) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${currentChapter.title}. ${currentChapter.paragraphs.join(' ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const changeChapter = (nextIndex: number) => {
    stopSpeech();
    setFocusedParagraph(null);
    setChapterIndex(nextIndex);
    setShowToc(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updatePref = <K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) => {
    onUpdatePreferences({
      ...preferences,
      [key]: value,
    });
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-200`}>
      {/* Sticky Reader Toolbar */}
      <header className={`sticky top-0 z-40 border-b ${theme.border} ${theme.surface}/95 backdrop-blur-sm`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-3 py-2 text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap shrink-0 cursor-pointer`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Tutup</span>
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{book.title}</p>
              <p className={`truncate text-xs ${theme.muted}`}>
                Bab <span className="font-mono tabular-nums">{chapterIndex + 1}</span> dari{' '}
                <span className="font-mono tabular-nums">{book.chapters.length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeech}
                aria-label={isSpeaking ? 'Hentikan suara pembaca' : 'Bacakan bab ini dengan suara'}
                className={`inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer ${
                  isSpeaking ? 'bg-[#214232] text-[#FBF9F4] border-[#214232]' : ''
                }`}
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{isSpeaking ? 'Hentikan' : 'Dengarkan'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowToc((prev) => !prev);
                setShowSettings(false);
              }}
              aria-expanded={showToc}
              className={`inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer`}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Daftar Bab</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSettings((prev) => !prev);
                setShowToc(false);
              }}
              aria-expanded={showSettings}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#214232] px-3.5 py-2 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>Tampilan Baca</span>
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className={`h-1 w-full ${theme.border} bg-black/5`}>
          <div
            className="h-full bg-[#4E7458] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Accessibility & Typography Settings Panel */}
        {showSettings && (
          <div className={`border-t ${theme.border} ${theme.surface} px-4 py-5 sm:px-6`}>
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Pengaturan Kenyamanan & Aksesibilitas Baca</h2>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  aria-label="Tutup pengaturan"
                  className="rounded-md p-1 hover:bg-black/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Font Size */}
                <div>
                  <p className={`text-xs font-medium ${theme.muted}`}>Ukuran Huruf</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePref('fontSize', Math.max(15, preferences.fontSize - 2))}
                      aria-label="Perkecil huruf"
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border} cursor-pointer`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[3.5rem] text-center font-mono text-sm tabular-nums">
                      {preferences.fontSize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => updatePref('fontSize', Math.min(26, preferences.fontSize + 2))}
                      aria-label="Perbesar huruf"
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border} cursor-pointer`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Line Height */}
                <div>
                  <p className={`text-xs font-medium ${theme.muted}`}>Jarak Antarbaris</p>
                  <div className="mt-2 flex gap-1.5">
                    {[
                      { label: 'Nyaman', value: 1.6 },
                      { label: 'Lega', value: 1.85 },
                      { label: 'Ekstra', value: 2.15 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => updatePref('lineHeight', opt.value)}
                        className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium cursor-pointer ${
                          Math.abs(preferences.lineHeight - opt.value) < 0.05
                            ? 'border-[#214232] bg-[#214232] text-[#FBF9F4]'
                            : `${theme.border}`
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <p className={`text-xs font-medium ${theme.muted}`}>Warna Latar</p>
                  <div className="mt-2 flex gap-1.5">
                    {[
                      { id: 'cream', label: 'Krem' },
                      { id: 'white', label: 'Putih' },
                      { id: 'dark-sage', label: 'Malam' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updatePref('theme', opt.id as ReadingPreferences['theme'])
                        }
                        className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium cursor-pointer ${
                          preferences.theme === opt.id
                            ? 'border-[#214232] bg-[#214232] text-[#FBF9F4]'
                            : `${theme.border}`
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Style & Guide */}
                <div>
                  <p className={`text-xs font-medium ${theme.muted}`}>Gaya Huruf & Panduan</p>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updatePref('fontFamily', preferences.fontFamily === 'serif' ? 'sans' : 'serif')
                      }
                      className={`flex-1 rounded-lg border px-2.5 py-2 text-xs font-medium cursor-pointer ${theme.border}`}
                    >
                      {preferences.fontFamily === 'serif' ? 'Serif' : 'Sans Ramah'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePref('readingGuide', !preferences.readingGuide)}
                      className={`flex-1 rounded-lg border px-2.5 py-2 text-xs font-medium cursor-pointer ${
                        preferences.readingGuide
                          ? 'border-[#214232] bg-[#214232] text-[#FBF9F4]'
                          : `${theme.border}`
                      }`}
                    >
                      Fokus Baris
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table of Contents Drawer */}
        {showToc && (
          <div className={`border-t ${theme.border} ${theme.surface} px-4 py-4 sm:px-6`}>
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Daftar Bab</h2>
                <button
                  type="button"
                  onClick={() => setShowToc(false)}
                  aria-label="Tutup daftar bab"
                  className="rounded-md p-1 hover:bg-black/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {book.chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => changeChapter(idx)}
                    className={`rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                      idx === chapterIndex
                        ? 'border-[#214232] bg-[#214232] text-[#FBF9F4]'
                        : `${theme.border} hover:opacity-80`
                    }`}
                  >
                    <p className="font-medium">{ch.title}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      Estimasi {ch.estimatedMinutes} menit
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Reading Canvas */}
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <article>
          <header className={`border-b ${theme.border} pb-6`}>
            <p className={`text-xs font-medium uppercase tracking-widest ${theme.muted}`}>
              {book.author} · {book.category}
            </p>
            <h1 className="mt-2 font-editorial text-2xl font-semibold leading-snug sm:text-3xl">
              {currentChapter?.title}
            </h1>
            <p className={`mt-2 text-xs ${theme.muted}`}>
              Estimasi waktu baca {currentChapter?.estimatedMinutes || 3} menit
            </p>
          </header>

          <div
            className={`mt-8 space-y-6 ${
              preferences.fontFamily === 'serif' ? 'font-editorial' : 'font-sans'
            }`}
            style={{
              fontSize: `${preferences.fontSize}px`,
              lineHeight: preferences.lineHeight,
            }}
          >
            {(currentChapter?.paragraphs || []).map((para, idx) => {
              const isHighlighted = preferences.readingGuide && focusedParagraph === idx;
              return (
                <p
                  key={idx}
                  tabIndex={preferences.readingGuide ? 0 : undefined}
                  onMouseEnter={() => preferences.readingGuide && setFocusedParagraph(idx)}
                  onFocus={() => preferences.readingGuide && setFocusedParagraph(idx)}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    isHighlighted ? theme.highlight : ''
                  }`}
                >
                  {para}
                </p>
              );
            })}
          </div>
        </article>

        {/* Chapter Navigation */}
        <nav
          aria-label="Navigasi bab"
          className={`mt-14 flex items-center justify-between gap-4 border-t ${theme.border} pt-6`}
        >
          <button
            type="button"
            disabled={chapterIndex === 0}
            onClick={() => changeChapter(chapterIndex - 1)}
            className={`inline-flex items-center gap-2 rounded-lg border ${theme.border} px-4 py-2.5 text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Bab Sebelumnya</span>
          </button>

          <span className={`font-mono text-xs tabular-nums ${theme.muted}`}>
            {chapterIndex + 1} / {book.chapters.length}
          </span>

          <button
            type="button"
            disabled={chapterIndex >= book.chapters.length - 1}
            onClick={() => changeChapter(chapterIndex + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#214232] px-4 py-2.5 text-sm font-medium text-[#FBF9F4] hover:bg-[#183326] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Bab Berikutnya</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      </main>
    </div>
  );
}
