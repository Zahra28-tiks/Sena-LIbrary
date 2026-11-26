import { BookOpen, CalendarClock, RotateCcw } from 'lucide-react';
import { Book, Loan, PublicUser } from '../types/library.ts';

interface LoansViewProps {
  currentUser: PublicUser | null;
  loans: Loan[];
  books: Book[];
  actionPendingId: string | null;
  onOpenAuth: () => void;
  onExploreCatalog: () => void;
  onReadBook: (book: Book) => void;
  onRenewLoan: (loanId: string) => void;
  onReturnLoan: (loanId: string) => void;
}

function formatDateID(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysRemaining(dueIso: string): number {
  const diff = new Date(dueIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function LoansView({
  currentUser,
  loans,
  books,
  actionPendingId,
  onOpenAuth,
  onExploreCatalog,
  onReadBook,
  onRenewLoan,
  onReturnLoan,
}: LoansViewProps) {
  if (!currentUser) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-[#E6E0D0] bg-gradient-to-br from-[#FFFDF7] via-[#EFF7F0] to-[#FEF8E7] px-6 py-14 text-center">
          <h1 className="font-editorial text-3xl font-bold text-[#173326]">
            Peminjaman Buku Digital
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-[#456354]">
            Masuk atau daftar sebagai anggota untuk meminjam buku, memantau batas waktu baca, dan
            memperpanjang masa pinjam dengan mudah.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="mt-6 rounded-xl bg-[#1F563E] px-6 py-3 text-sm font-semibold text-[#FFFDF7] hover:bg-[#17422F] cursor-pointer"
          >
            Masuk atau Daftar Anggota
          </button>
        </div>
      </section>
    );
  }

  const activeLoans = loans.filter((l) => l.status === 'active');
  const returnedLoans = loans.filter((l) => l.status === 'returned');

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-[#E6E0D0] bg-gradient-to-r from-[#EFF7F0] via-[#FFFDF7] to-[#FEF8E7] p-6 sm:p-8">
        <h1 className="font-editorial text-3xl font-bold text-[#173326] sm:text-4xl">
          Peminjaman Saya
        </h1>
        <p className="mt-2 text-base text-[#456354]">
          Kelola buku yang sedang dipinjam, perpanjang masa baca hingga 2 kali, atau kembalikan
          lebih awal.
        </p>
      </div>

      {/* Active Loans */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#173326]">
          Sedang Dipinjam (<span className="font-mono tabular-nums">{activeLoans.length}</span>)
        </h2>

        {activeLoans.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-[#E6E0D0] bg-white p-8 text-center">
            <p className="text-base font-semibold text-[#173326]">
              Belum ada buku yang sedang kamu pinjam
            </p>
            <p className="mt-1 text-sm text-[#456354]">
              Pilih buku favoritmu di katalog lalu tekan tombol Pinjam Buku untuk masa baca 7 hari.
            </p>
            <button
              type="button"
              onClick={onExploreCatalog}
              className="mt-5 rounded-xl bg-[#1F563E] px-5 py-2.5 text-sm font-semibold text-[#FFFDF7] hover:bg-[#17422F] cursor-pointer"
            >
              Lihat Katalog Buku
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {activeLoans.map((loan) => {
              const bookObj = books.find((b) => b.id === loan.bookId);
              const daysLeft = getDaysRemaining(loan.dueAt);
              const isBusy = actionPendingId === loan.id;

              return (
                <div
                  key={loan.id}
                  className="flex flex-col justify-between gap-5 rounded-2xl border border-[#E6E0D0] bg-white p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-[#173326]">
                      {loan.bookTitle}
                    </h3>
                    <p className="mt-0.5 text-sm text-[#456354]">{loan.bookAuthor}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#456354]">
                      <span>
                        Dipinjam:{' '}
                        <strong className="font-mono font-medium text-[#173326]">
                          {formatDateID(loan.borrowedAt)}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Jatuh tempo:{' '}
                        <strong className="font-mono font-medium text-[#173326]">
                          {formatDateID(loan.dueAt)}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#1F563E]">
                        Sisa <span className="font-mono tabular-nums">{daysLeft}</span> hari
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {bookObj && (
                      <button
                        type="button"
                        onClick={() => onReadBook(bookObj)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1F563E] px-4 py-2.5 text-sm font-semibold text-[#FFFDF7] hover:bg-[#17422F] whitespace-nowrap cursor-pointer"
                      >
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        <span>Baca</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy || loan.renewCount >= 2}
                      onClick={() => onRenewLoan(loan.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECD79A] bg-[#FDF1CC] px-3.5 py-2.5 text-sm font-semibold text-[#173326] hover:bg-[#FCE6A6] disabled:opacity-50 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                    >
                      <CalendarClock className="h-4 w-4 text-[#1F563E]" aria-hidden="true" />
                      <span>
                        {loan.renewCount >= 2 ? 'Batas Perpanjang' : 'Perpanjang (+7h)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onReturnLoan(loan.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D2C2] bg-[#FAF6EC] px-3.5 py-2.5 text-sm font-medium text-[#173326] hover:bg-[#EFEAE0] disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      <span>{isBusy ? 'Memproses...' : 'Kembalikan'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan History */}
      {returnedLoans.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-[#173326]">
            Riwayat Peminjaman (<span className="font-mono tabular-nums">{returnedLoans.length}</span>)
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E6E0D0] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E6E0D0] bg-[#FAF6EC] text-xs text-[#456354]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Judul Buku</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Pinjam</th>
                  <th className="px-4 py-3 font-semibold">Dikembalikan</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEAE0]">
                {returnedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#FFFDF7]">
                    <td className="px-4 py-3 font-medium text-[#173326]">{loan.bookTitle}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#456354]">
                      {formatDateID(loan.borrowedAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#456354]">
                      {loan.returnedAt ? formatDateID(loan.returnedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#1F563E]">Selesai</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
