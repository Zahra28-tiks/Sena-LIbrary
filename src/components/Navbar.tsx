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
    <header className="sticky top-0 z-40 border-b border-[#DFDDD2] bg-[#F8F5EE]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-editorial text-xl font-semibold tracking-tight text-[#1A2B22] whitespace-nowrap shrink-0 cursor-pointer"
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
                    ? 'text-[#1A2B22] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#214232]'
                    : 'text-[#4A5D52] hover:text-[#1A2B22]'
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
              className="rounded-lg bg-[#214232] px-4 py-2 text-sm font-medium text-[#FBF9F4] transition-colors hover:bg-[#183326] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-expanded={accountMenuOpen}
                className="flex items-center gap-2 rounded-lg border border-[#CBD3CA] bg-[#FBF9F4] px-3.5 py-2 text-sm font-medium text-[#1A2B22] transition-colors hover:bg-[#EDF1EC] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="h-4 w-4 text-[#214232]" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-[#DFDDD2] bg-[#FBF9F4] p-2 shadow-lg"
                >
                  <div className="border-b border-[#E8E4D9] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-[#1A2B22]">{currentUser.name}</p>
                    <p className="truncate text-xs text-[#4A5D52]">{currentUser.email}</p>
                    <p className="mt-1 text-xs font-medium text-[#214232]">
                      {currentUser.role === 'admin' ? 'Administrator Perpustakaan' : 'Anggota Aktif'}
                    </p>
                  </div>
                  <div className="pt-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleNav('loans')}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
                    >
                      Peminjaman Saya
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleNav('favorites')}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
                    >
                      Daftar Favorit
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav('admin')}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[#1A2B22] hover:bg-[#EDF1EC] cursor-pointer"
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
                      className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-[#E8E4D9] px-3 py-2 text-left text-sm text-[#7F2D2D] hover:bg-[#F7ECEC] cursor-pointer"
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
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#CBD3CA] bg-[#FBF9F4] text-[#1A2B22] md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="border-t border-[#DFDDD2] bg-[#FBF9F4] px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`flex min-h-[44px] items-center rounded-lg px-3 py-2 text-left text-base font-medium ${
                    isActive
                      ? 'bg-[#DCE5DC] text-[#1A2B22]'
                      : 'text-[#4A5D52] hover:bg-[#F0ECE1] hover:text-[#1A2B22]'
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
