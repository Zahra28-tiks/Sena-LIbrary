import { useState } from 'react';
import { LogOut, Menu, User, X } from 'lucide-react';
import { PublicUser } from '../types/library.ts';

export type NavView = 'home' | 'catalog' | 'favorites' | 'loans' | 'admin';

interface NavbarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  currentUser: PublicUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: NavView; label: string }[] = [
  { id: 'home', label: 'Beranda' },
  { id: 'catalog', label: 'Katalog' },
  { id: 'favorites', label: 'Favorit' },
  { id: 'loans', label: 'Peminjaman' },
  { id: 'admin', label: 'Admin' },
];

export function Navbar({
  activeView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleNav = (view: NavView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6E0D0] bg-[#FFFDF7]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-editorial text-xl font-bold tracking-tight text-[#1F563E] whitespace-nowrap shrink-0 cursor-pointer"
        >
          SENA LIBRARY
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#173326] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-full after:bg-[#E2A93B]'
                    : 'text-[#456354] hover:text-[#173326]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {!currentUser ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded-xl bg-[#1F563E] px-4 py-2 text-sm font-semibold text-[#FFFDF7] transition-colors hover:bg-[#17422F] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-expanded={accountMenuOpen}
                className="flex items-center gap-2 rounded-xl border border-[#CBE0CE] bg-[#EFF7F0] px-3.5 py-2 text-sm font-medium text-[#173326] transition-colors hover:bg-[#E1F0E3] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="h-4 w-4 text-[#1F563E]" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E6E0D0] bg-white p-2 shadow-lg"
                >
                  <div className="border-b border-[#EFEAE0] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-[#173326]">
                      {currentUser.name}
                    </p>
                    <p className="truncate text-xs text-[#456354]">{currentUser.email}</p>
                    <p className="mt-1 text-xs font-semibold text-[#1F563E]">
                      {currentUser.role === 'admin'
                        ? 'Administrator Perpustakaan'
                        : 'Anggota Ceria SENA'}
                    </p>
                  </div>
                  <div className="pt-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleNav('loans')}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#173326] hover:bg-[#EFF7F0] cursor-pointer"
                    >
                      Peminjaman Saya
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleNav('favorites')}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#173326] hover:bg-[#EFF7F0] cursor-pointer"
                    >
                      Daftar Favorit
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav('admin')}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#173326] hover:bg-[#EFF7F0] cursor-pointer"
                      >
                        Dashboard Admin
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-[#EFEAE0] px-3 py-2 text-left text-sm text-[#A13B22] hover:bg-[#FCEAE3] cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8D2C2] bg-white text-[#173326] md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="border-t border-[#E6E0D0] bg-white px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`flex min-h-[44px] items-center rounded-xl px-3 py-2 text-left text-base font-medium ${
                    isActive
                      ? 'bg-[#E5F1E7] text-[#173326]'
                      : 'text-[#456354] hover:bg-[#FAF6EC] hover:text-[#173326]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
