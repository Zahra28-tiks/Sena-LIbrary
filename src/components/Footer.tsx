import { NavView } from './Navbar.tsx';

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#E6E0D0] bg-[#F3EFE2]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-editorial text-xl font-bold text-[#1F563E]">SENA LIBRARY</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#456354]">
              Perpustakaan digital yang hangat, ceria, dan inklusif—menghadirkan ruang baca yang
              menyenangkan dan mudah diakses oleh semua kalangan.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#173326]">Navigasi Cepat</p>
            <ul className="mt-3 space-y-2 text-sm text-[#456354]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#173326] hover:underline cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-[#173326] hover:underline cursor-pointer"
                >
                  Katalog Digital
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('favorites')}
                  className="hover:text-[#173326] hover:underline cursor-pointer"
                >
                  Daftar Favorit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('loans')}
                  className="hover:text-[#173326] hover:underline cursor-pointer"
                >
                  Peminjaman Buku
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#173326]">Membaca Lebih Nyaman</p>
            <p className="mt-3 text-sm leading-relaxed text-[#456354]">
              Setiap koleksi mendukung huruf besar, jarak antarbaris lega, pilihan warna latar
              hangat bebas silau, serta fitur suara pembaca untuk pengalaman belajar yang ramah.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#E0DAC8] pt-6 text-xs text-[#456354] sm:flex-row sm:items-center">
          <p>© 2026 SENA LIBRARY. Ruang Literasi Ceria & Inklusif untuk Semua.</p>
          <p>Terbuka 24 Jam · Gratis untuk Anggota</p>
        </div>
      </div>
    </footer>
  );
}
