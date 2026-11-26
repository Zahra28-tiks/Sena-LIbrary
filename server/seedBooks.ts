import { Book } from '../src/types/library.ts';

export const SEED_BOOKS: Book[] = [
  {
    id: 'bk-jejak-aksara',
    title: 'Jejak Aksara di Balik Embun',
    author: 'Nadia Larasati',
    category: 'Sastra & Fiksi',
    year: 2025,
    isbn: '978-623-8104-11-2',
    publisher: 'Pustaka Sena',
    language: 'Bahasa Indonesia',
    pages: 218,
    totalCopies: 6,
    availableCopies: 5,
    coverUrl: '/src/assets/images/cover_jejak_aksara_1795659418063.jpg',
    coverTone: 'cream-sage',
    accessibilityFeatures: ['Ramah Disleksia', 'Teks Besar', 'Struktur Bab Jelas', 'Ringkasan Suara'],
    synopsis:
      'Kisah hangat tentang seorang pustakawan muda di lereng Dieng yang membangun taman baca keliling bagi anak-anak desa dan lansia. Novel ini ditulis dengan kalimat yang jernih, ritme tenang, serta refleksi mendalam tentang bagaimana membaca menyatukan lintas generasi.',
    featured: true,
    readCount: 184,
    createdAt: '2026-01-12T08:00:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Pagi di Ruang Baca Lama',
        estimatedMinutes: 4,
        paragraphs: [
          'Kabut tipis masih menggantung di atas genteng kayu ketika Raka membuka jendela ruang baca. Udara pegunungan membawa wangi tanah basah dan daun teh yang baru dipetik dari kebun sebelah.',
          'Di atas meja panjang berbahan kayu jati muda, tiga kotak buku baru tersusun rapi. Ada buku bergambar huruf besar untuk Ibu Kartini yang matanya mulai rabun, buku cerita rakyat berhuruf jelas untuk anak-anak sekolah dasar, serta panduan bertani organik bagi para pemuda desa.',
          'Bagi Raka, perpustakaan bukan sekadar gudang penyimpanan kertas. Ia percaya ruang baca yang baik harus menyambut siapa pun tanpa syarat—baik mereka yang sudah fasih membaca ratusan halaman, maupun mereka yang baru belajar mengeja satu kata demi satu kata.',
          'Ketika lonceng kayu di beranda berbunyi pelan, tanda pengunjung pertama datang, Raka tersenyum. Hari ini, lembaran-lembaran tenang itu akan kembali menemukan pembacanya.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Surat dari Lembah Sebelah',
        estimatedMinutes: 5,
        paragraphs: [
          'Menjelang tengah hari, seorang kurir sepeda berhenti di halaman berkerikil. Ia menyerahkan amplop cokelat berstempel pos kecamatan dari dusun seberang sungai.',
          'Surat itu ditulis dengan tulisan tangan rapi oleh Bu Ratna, guru kelas tiga yang mengajar tanpa papan tulis memadai. Ia menanyakan apakah gerobak baca Sena dapat singgah setiap Kamis sore agar murid-muridnya bisa meminjam buku cerita bergambar.',
          'Raka segera mencatat jadwal baru di buku agenda bersampul hijau lumut. Ia juga menambahkan dua puluh salinan buku dengan jarak antarbaris lega agar anak-anak yang mengalami kesulitan mengeja dapat membaca dengan lebih nyaman tanpa cepat lelah.',
          'Sore itu, ruang baca terasa lebih hangat dari biasanya. Beberapa warga duduk melingkar di kursi empuk berwarna hijau sage, saling bertukar cerita tentang buku yang baru mereka selesaikan.'
        ]
      },
      {
        id: 'ch-3',
        title: 'Bab 3: Lampu Kecil di Beranda',
        estimatedMinutes: 4,
        paragraphs: [
          'Ketika senja turun, cahaya lampu kuning lembut menerangi rak-rak kayu di sudut ruangan. Tidak ada suara bising, hanya gesekan pelan halaman buku dan napas lega para pembaca.',
          'Seorang siswa SMA bernama Dimas menutup buku sejarahnya dan menatap keluar jendela. Untuk pertama kalinya, ia merasa tugas sekolahnya tidak lagi menakutkan karena ia punya tempat yang tenang untuk belajar dan bertanya tanpa takut dihakimi.',
          'Raka mematikan lampu utama saat pukul delapan malam tiba, menyisakan satu lampu beranda yang tetap menyala sebagai penanda bahwa esok pagi pintu perpustakaan akan kembali terbuka untuk semua orang.'
        ]
      }
    ]
  },
  {
    id: 'bk-ekologi-nusantara',
    title: 'Ekologi Hutan & Kearifan Nusantara',
    author: 'Dr. Bagus Prasetyo',
    category: 'Sains & Ekologi',
    year: 2024,
    isbn: '978-623-8104-24-2',
    publisher: 'Cendekia Alam',
    language: 'Bahasa Indonesia',
    pages: 296,
    totalCopies: 5,
    availableCopies: 4,
    coverUrl: '/src/assets/images/cover_ekologi_nusantara_1795659417907.jpg',
    coverTone: 'sand-botanical',
    accessibilityFeatures: ['Struktur Bab Jelas', 'Teks Besar', 'Ringkasan Suara'],
    synopsis:
      'Pengantar ekologi populer yang menjelaskan hubungan erat antara tanaman paku, hutan hujan tropis, dan praktik pelestarian masyarakat adat di Indonesia. Disusun dengan bahasa ilmiah yang membumi sehingga mudah dipahami oleh pelajar maupun pembaca umum.',
    featured: true,
    readCount: 142,
    createdAt: '2026-01-20T09:30:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Penjaga Lantai Hutan',
        estimatedMinutes: 4,
        paragraphs: [
          'Jika kita melangkah pelan ke dalam hutan hujan pegunungan di Jawa atau Sumatra, pandangan pertama sering tertuju pada kanopi pohon raksasa. Padahal, kehidupan paling sibuk justru berlangsung tepat di permukaan tanah yang lembap.',
          'Tumbuhan paku dan lumut bekerja seperti spons alami. Mereka menahan air hujan agar tidak langsung menggerus tanah, lalu melepaskannya perlahan ke mata air di hilir.',
          'Tanpa lapisan hijau yang sunyi ini, sungai-sungai kecil di desa sekitar hutan akan mudah mengering saat kemarau dan meluap ketika musim hujan tiba.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Pengetahuan yang Diturunkan',
        estimatedMinutes: 5,
        paragraphs: [
          'Jauh sebelum istilah konservasi modern dikenal, berbagai komunitas adat di Nusantara sudah menerapkan sistem hutan larangan. Area tertentu tidak boleh ditebang karena berfungsi sebagai penyimpan air utama.',
          'Pengetahuan ekologis tersebut diwariskan melalui cerita lisan, nyanyian musim tanam, dan tata aturan kampung yang dihormati bersama. Sains modern kini membuktikan bahwa daerah dengan kearifan lokal yang terjaga memiliki keanekaragaman hayati jauh lebih tinggi.',
          'Mempelajari ekologi berarti belajar mendengar kembali bagaimana alam dan manusia bisa hidup berdampingan secara adil dan berkelanjutan.'
        ]
      },
      {
        id: 'ch-3',
        title: 'Bab 3: Langkah Kecil di Kebun Kota',
        estimatedMinutes: 4,
        paragraphs: [
          'Konservasi tidak harus selalu dimulai dari rimba belantara. Menanam tanaman lokal di pekarangan rumah, membuat lubang resapan air, dan mengurangi sampah plastik adalah bagian dari merawat ekosistem yang sama.',
          'Setiap ruang hijau sekecil apa pun mampu menjadi rumah bagi serangga penyerbuk, burung kecil, dan keteduhan bagi warga sekitar.'
        ]
      }
    ]
  },
  {
    id: 'bk-arsitektur-cahaya',
    title: 'Arsitektur Ruang Publik yang Ramah',
    author: 'Ir. Meutia Handayani',
    category: 'Sejarah & Budaya',
    year: 2025,
    isbn: '978-623-8104-39-6',
    publisher: 'Loka Karya Press',
    language: 'Bahasa Indonesia',
    pages: 244,
    totalCopies: 4,
    availableCopies: 4,
    coverUrl: '/src/assets/images/cover_arsitektur_cahaya_1795659419135.jpg',
    coverTone: 'mist-editorial',
    accessibilityFeatures: ['Ramah Disleksia', 'Struktur Bab Jelas', 'Teks Besar'],
    synopsis:
      'Membahas sejarah serta prinsip desain universal dalam bangunan publik—mulai dari jalur landai, pencahayaan alami yang tidak menyilaukan, hingga tata letak ruang baca yang mudah dinavigasi oleh lansia, anak-anak, dan penyandang disabilitas.',
    featured: true,
    readCount: 119,
    createdAt: '2026-02-02T10:15:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Mengukur Ruang dengan Empati',
        estimatedMinutes: 4,
        paragraphs: [
          'Sebuah gedung baru terlihat berhasil bukan hanya ketika difoto dari jauh, melainkan saat siapa pun bisa masuk dan menggunakannya tanpa rasa canggung atau hambatan fisik.',
          'Dalam prinsip desain universal, jalur landai dengan kemiringan lembut tidak dibuat tersembunyi di pintu belakang. Ia menjadi pintu masuk utama yang nyaman dilalui oleh pengguna kursi roda, orang tua yang mendorong kereta bayi, maupun lansia yang lututnya mudah nyeri.',
          'Ketika ruang publik dirancang untuk kelompok yang paling membutuhkan aksesibilitas, seluruh masyarakat ikut merasakan kenyamanannya.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Cahaya Alami dan Ketenangan Mata',
        estimatedMinutes: 4,
        paragraphs: [
          'Cahaya matahari pagi yang dipantulkan dinding berwarna krem lembut menghasilkan penerangan merata tanpa silau. Ini jauh lebih ramah di mata dibandingkan lampu neon putih yang berkedip terlalu terang.',
          'Warna-warna bernuansa alam seperti krem pasir dan hijau sage membantu menurunkan ketegangan visual, terutama bagi pembaca yang sensitif terhadap cahaya berlebih.'
        ]
      },
      {
        id: 'ch-3',
        title: 'Bab 3: Papan Penunjuk yang Mudah Dibaca',
        estimatedMinutes: 3,
        paragraphs: [
          'Tipografi yang baik di ruang publik mengutamakan keterbacaan di atas hiasan rumit. Huruf harus cukup besar, memiliki kontras warna yang jelas dengan latar belakangnya, dan ditempatkan pada ketinggian yang nyaman dilihat semua orang.'
        ]
      }
    ]
  },
  {
    id: 'bk-ruang-inklusi',
    title: 'Membangun Literasi Inklusif untuk Semua',
    author: 'Ratih Kusumawardhani',
    category: 'Pendidikan & Inklusi',
    year: 2026,
    isbn: '978-623-8104-52-5',
    publisher: 'Pustaka Sena',
    language: 'Bahasa Indonesia',
    pages: 188,
    totalCopies: 8,
    availableCopies: 7,
    coverUrl: '/src/assets/images/cover_ruang_inklusi_1795659417871.jpg',
    coverTone: 'forest-linen',
    accessibilityFeatures: ['Ramah Disleksia', 'Teks Besar', 'Struktur Bab Jelas', 'Ringkasan Suara'],
    synopsis:
      'Panduan praktis bagi pendidik, orang tua, dan pengelola komunitas dalam menciptakan pengalaman membaca yang inklusif. Mengulas cara menyajikan teks ramah disleksia, dukungan pembaca layar, serta strategi menumbuhkan minat baca tanpa paksaan.',
    featured: true,
    readCount: 208,
    createdAt: '2026-02-14T11:00:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Setiap Pembaca Punya Ritme Sendiri',
        estimatedMinutes: 4,
        paragraphs: [
          'Sering kali kita mengukur kecintaan seseorang pada buku dari seberapa cepat ia menamatkannya. Padahal, memahami satu paragraf dengan tenang dan penuh makna jauh lebih berharga daripada membaca puluhan halaman secara tergesa-gesa.',
          'Literasi inklusif menghargai keberagaman cara belajar. Ada orang yang nyaman membaca huruf serif di atas kertas krem hangat, ada yang terbantu oleh huruf sans-serif berukuran besar dengan jarak baris lega, dan ada pula yang lebih mudah menyerap pengetahuan melalui suara.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Merancang Teks yang Nyaman di Mata',
        estimatedMinutes: 4,
        paragraphs: [
          'Kontras yang terlalu tajam seperti hitam pekat di atas putih menyilaukan terkadang membuat mata cepat lelah. Menggeser warna latar ke krem lembut dan teks ke hijau tua gelap dapat mengurangi silau sekaligus menjaga kejelasan huruf.',
          'Selain itu, panjang baris bacaan sebaiknya dijaga agar tidak terlalu lebar di layar besar. Sekitar enam puluh hingga tujuh puluh karakter per baris membantu mata berpindah ke baris berikutnya tanpa tersesat.'
        ]
      },
      {
        id: 'ch-3',
        title: 'Bab 3: Perpustakaan sebagai Rumah Bersama',
        estimatedMinutes: 4,
        paragraphs: [
          'Ketika teknologi digital dipadukan dengan kepedulian sosial, perpustakaan bisa menjangkau desa terpencil, pekerja malam, hingga teman-teman dengan kebutuhan akses khusus. Semua berhak merasakan kegembiraan menemukan ide baru.'
        ]
      }
    ]
  },
  {
    id: 'bk-tenang-digital',
    title: 'Seni Membaca di Era Serba Cepat',
    author: 'Hendra Wijaya',
    category: 'Pengembangan Diri',
    year: 2025,
    isbn: '978-623-8104-67-9',
    publisher: 'Ruang Tenang',
    language: 'Bahasa Indonesia',
    pages: 164,
    totalCopies: 5,
    availableCopies: 5,
    coverUrl: '/src/assets/images/cover_jejak_aksara_1795659418063.jpg',
    coverTone: 'cream-sage',
    accessibilityFeatures: ['Ramah Disleksia', 'Teks Besar', 'Ringkasan Suara'],
    synopsis:
      'Refleksi ringan tentang bagaimana melatih fokus, menjaga ketenangan pikiran, dan mengembalikan kebiasaan membaca mendalam di tengah arus notifikasi harian yang terus berdatangan.',
    featured: false,
    readCount: 95,
    createdAt: '2026-02-20T14:20:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Memberi Jeda pada Perhatian',
        estimatedMinutes: 4,
        paragraphs: [
          'Setiap hari, perhatian kita ditarik ke puluhan arah oleh berita singkat dan pesan instan. Tidak heran jika duduk tenang membaca satu bab buku terasa lebih sulit dibanding sepuluh tahun lalu.',
          'Kabar baiknya, kemampuan fokus bukanlah bakat tetap, melainkan kebiasaan yang bisa dilatih kembali mulai dari sepuluh menit setiap sore tanpa gangguan suara.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Ritual Lima Belas Menit',
        estimatedMinutes: 4,
        paragraphs: [
          'Mulailah dengan memilih satu topik yang benar-benar membuat Anda penasaran. Matikan pemberitahuan sejenak, siapkan secangkir teh hangat, dan atur ukuran huruf bacaan senyaman mungkin.',
          'Ketika membaca menjadi momen istirahat, bukan kewajiban, halaman demi halaman akan mengalir dengan alami.'
        ]
      }
    ]
  },
  {
    id: 'bk-petualangan-bima',
    title: 'Petualangan Bima di Kebun Kunang-Kunang',
    author: 'Siti Aminah Putri',
    category: 'Cerita Anak & Remaja',
    year: 2026,
    isbn: '978-623-8104-73-0',
    publisher: 'Tunas Aksara',
    language: 'Bahasa Indonesia',
    pages: 96,
    totalCopies: 7,
    availableCopies: 6,
    coverUrl: '/src/assets/images/cover_ekologi_nusantara_1795659417907.jpg',
    coverTone: 'sand-botanical',
    accessibilityFeatures: ['Ramah Disleksia', 'Teks Besar', 'Struktur Bab Jelas', 'Ringkasan Suara'],
    synopsis:
      'Cerita hangat untuk anak-anak dan pembaca pemula tentang Bima yang membantu temannya, Lani, mengenali suara alam di kebun belakang rumah. Menggunakan kalimat pendek, kosakata ramah anak, dan pesan persahabatan yang inklusif.',
    featured: false,
    readCount: 163,
    createdAt: '2026-03-01T07:45:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Suara di Balik Semak Pandan',
        estimatedMinutes: 3,
        paragraphs: [
          'Sore itu matahari mulai turun di balik bukit kecil. Bima dan Lani duduk di bangku kayu dekat kolam ikan sambil membawa senter kecil.',
          'Lani menutup matanya sebentar. "Dengar, Bim! Ada suara jangkrik di sebelah kiri, dan gemericik air di sebelah kanan," kata Lani dengan gembira.',
          'Bima mengangguk takjub. Bersama Lani, ia belajar bahwa menikmati kebun bukan hanya lewat melihat warna bunga, tetapi juga lewat mendengar dan meraba lembutnya daun.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Cahaya Kecil di Malam Hari',
        estimatedMinutes: 3,
        paragraphs: [
          'Ketika langit berubah gelap kehijauan, tiga titik cahaya kecil melayang di atas rumpun bambu. Kunang-kunang mulai menari pelan.',
          'Bima menceritakan setiap gerakan cahaya itu kepada Lani dengan kata-kata yang hidup, sehingga mereka berdua tertawa bersama menikmati malam yang ramah.'
        ]
      }
    ]
  },
  {
    id: 'bk-sejarah-rempah',
    title: 'Jalur Rempah dan Pelabuhan Kuno',
    author: 'Prof. Darmawan Hakim',
    category: 'Sejarah & Budaya',
    year: 2024,
    isbn: '978-623-8104-88-4',
    publisher: 'Arsip Nusantara',
    language: 'Bahasa Indonesia',
    pages: 312,
    totalCopies: 4,
    availableCopies: 3,
    coverUrl: '/src/assets/images/cover_arsitektur_cahaya_1795659419135.jpg',
    coverTone: 'mist-editorial',
    accessibilityFeatures: ['Struktur Bab Jelas', 'Teks Besar'],
    synopsis:
      'Menelusuri bagaimana kota-kota pelabuhan di Nusantara menjadi titik temu budaya, bahasa, dan pengetahuan berabad-abad silam melalui perdagangan pala, cengkeh, dan lada.',
    featured: false,
    readCount: 87,
    createdAt: '2026-03-05T13:10:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Angin Muson dan Layar Kayu',
        estimatedMinutes: 5,
        paragraphs: [
          'Selama berabad-abad, pergerakan kapal dagang di perairan Nusantara mengikuti irama angin muson. Ketika angin bertiup dari barat, kapal-kapal berlayar menuju kepulauan rempah di timur.',
          'Sambil menunggu arah angin berganti beberapa bulan kemudian, para pelaut dan warga pelabuhan bertukar bahasa, resep masakan, hingga naskah ilmu pengetahuan.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Kota Pelabuhan yang Terbuka',
        estimatedMinutes: 4,
        paragraphs: [
          'Pasar pelabuhan kuno adalah ruang pertemuan paling beragam pada zamannya. Keterbukaan terhadap pendatang menjadikan kota-kota pesisir pusat lahirnya sastra dan kerajinan yang kaya warna.'
        ]
      }
    ]
  },
  {
    id: 'bk-sains-sehari-hari',
    title: 'Fisika Sederhana di Dapur Rumah',
    author: 'Yulia Pertiwi, M.Si.',
    category: 'Sains & Ekologi',
    year: 2026,
    isbn: '978-623-8104-95-2',
    publisher: 'Cendekia Alam',
    language: 'Bahasa Indonesia',
    pages: 176,
    totalCopies: 6,
    availableCopies: 6,
    coverUrl: '/src/assets/images/cover_ruang_inklusi_1795659417871.jpg',
    coverTone: 'forest-linen',
    accessibilityFeatures: ['Ramah Disleksia', 'Teks Besar', 'Struktur Bab Jelas', 'Ringkasan Suara'],
    synopsis:
      'Mengajak pembaca melihat keajaiban ilmu pengetahuan dari aktivitas sehari-hari: mengapa air mendidih, bagaimana roti mengembang, dan cara kerja pendinginan alami tanpa rumus yang rumit.',
    featured: false,
    readCount: 112,
    createdAt: '2026-03-10T09:00:00.000Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Bab 1: Perjalanan Panas di Panci Tanah Liat',
        estimatedMinutes: 4,
        paragraphs: [
          'Sains tidak hanya hidup di dalam laboratorium berdinding kaca. Setiap kali kita menyeduh kopi atau merebus air di dapur, prinsip perpindahan panas bekerja di depan mata kita.',
          'Panci tanah liat menghantarkan panas lebih lambat dan stabil dibanding logam tipis, sehingga kaldu atau rebusan rempah matang merata tanpa cepat gosong.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Bab 2: Gelembung Udara dalam Adonan Roti',
        estimatedMinutes: 4,
        paragraphs: [
          'Ketika ragi bertemu gula dan air hangat, ia menghasilkan gas karbon dioksida kecil-kecil yang terperangkap di dalam jaringan tepung. Itulah yang membuat roti terasa empuk ketika dipanggang.'
        ]
      }
    ]
  }
];
