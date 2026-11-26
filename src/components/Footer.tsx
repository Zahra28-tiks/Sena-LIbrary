import { NavView } from './Navbar.tsx';

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#DFDDD2] bg-[#F0ECE1]/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-editorial text-xl font-semibold text-[#1A2B22]">SENA LIBRARY</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#4A5D52]">
              Perpustakaan digital terbuka yang dirancang dengan tenang, inklusif, dan mudah diakses
              oleh pembaca dari berbagai kalangan, usia, dan kebutuhan belajar.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1A2B22]">Navigasi Cepat</p>
            <ul className="mt-3 space-y-2 text-sm text-[#4A5D52]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#1A2B22] hover:underline cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-[#1A2B22] hover:underline cursor-pointer"
                >
                  Katalog Digital
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('favorites')}
                  className="hover:text-[#1A2B22] hover:underline cursor-pointer"
                >
                  Daftar Favorit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('loans')}
                  className="hover:text-[#1A2B22] hover:underline cursor-pointer"
                >
                  Peminjaman Buku
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1A2B22]">Komitmen Aksesibilitas</p>
            <p className="mt-3 text-sm leading-relaxed text-[#4A5D52]">
              Setiap buku di SENA LIBRARY mendukung pengaturan ukuran huruf, jarak baris lega, tema
              baca lembut bebas silau, serta navigasi papan ketik yang jelas.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#DFDDD2] pt-6 text-xs text-[#4A5D52] sm:flex-row sm:items-center">
          <p>© 2026 SENA LIBRARY. Ruang Baca Digital Inklusif untuk Semua.</p>
          <p>Terbuka 24 Jam · Akses Gratis Anggota</p>
        </div>
      </div>
    </footer>
  );
}
