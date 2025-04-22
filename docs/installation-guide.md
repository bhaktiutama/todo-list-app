# Panduan Instalasi Todo List Pastebin

Panduan ini akan membantu Anda menginstal dan menjalankan Todo List Pastebin di lingkungan lokal.

## Prasyarat

Sebelum memulai, pastikan Anda memiliki:

- Node.js versi 18 atau lebih tinggi
- NPM atau Yarn
- Git
- Akun Supabase (gratis)
- Editor kode (disarankan: VS Code)

## Setup Supabase

1. Buat akun Supabase di [supabase.com](https://supabase.com)
2. Buat project baru
3. Catat URL dan anon key dari project
4. Jalankan migrasi database:
   - Buka SQL Editor di dashboard Supabase
   - Copy dan paste semua file migrasi dari folder `supabase/migrations`
   - Jalankan migrasi secara berurutan

## Setup Frontend

1. Clone repository:

```bash
git clone https://github.com/username/todo-list-app.git
cd todo-list-app
```

2. Install dependencies frontend:

```bash
cd frontend
npm install
```

3. Setup environment variables:
   - Copy `.env.local.example` ke `.env.local`
   - Update nilai variabel dengan credentials Supabase Anda:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Jalankan development server:

```bash
npm run dev
```

5. Buka http://localhost:3000 di browser

## Struktur Proyek

```
todo-list-app/
├── frontend/               # Kode frontend Next.js
│   ├── public/            # Aset statis
│   │   ├── app/          # Komponen Next.js App Router
│   │   ├── components/   # Komponen React reusable
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Library dan utilities
│   │   ├── services/     # Layanan API Supabase
│   │   └── types/        # Type definitions
│   └── package.json      # Dependensi frontend
└── supabase/             # Konfigurasi Supabase
    └── migrations/       # File migrasi SQL
```

## Troubleshooting

### Masalah Umum

1. **Error "Failed to load data"**

   - Periksa credentials Supabase di `.env.local`
   - Pastikan project Supabase aktif
   - Periksa console browser untuk error detail

2. **Migrasi database gagal**

   - Jalankan migrasi secara berurutan
   - Pastikan tidak ada error syntax SQL
   - Reset database jika diperlukan dan coba lagi

3. **Type errors TypeScript**
   - Jalankan `npm run build` untuk mengecek type errors
   - Update types jika ada perubahan schema database

### Debug Mode

Untuk mengaktifkan debug mode:

1. Tambahkan di browser console:

```javascript
localStorage.setItem('debug', '*');
```

2. Refresh halaman untuk melihat log detail

## Deployment

### Deploy ke Vercel

1. Push kode ke GitHub
2. Import project di Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Deploy ke Platform Lain

1. Build frontend:

```bash
cd frontend
npm run build
```

2. Set environment variables yang diperlukan
3. Deploy folder `frontend/.next`

## Keamanan

- Jangan commit file `.env.local`
- Gunakan Row Level Security Supabase
- Batasi akses API dengan policy
- Monitor penggunaan di dashboard Supabase

## Pemeliharaan

### Update Dependencies

```bash
cd frontend
npm update
npm audit fix
```

### Backup Database

- Gunakan fitur backup otomatis Supabase
- Export data manual secara berkala
- Simpan backup di lokasi aman

## Support

Jika Anda mengalami masalah:

1. Cek [issues di GitHub](https://github.com/username/todo-list-app/issues)
2. Buat issue baru dengan detail:
   - Versi Node.js
   - Output error
   - Langkah-langkah reproduksi
   - Screenshot jika relevan

## Lisensi

Proyek ini dilisensikan di bawah MIT License. Lihat file LICENSE untuk detail.
