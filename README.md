# Todo List Pastebin

Aplikasi Todo List yang dapat dibagikan, dibangun dengan Go/Supabase dan Next.js, terinspirasi oleh Pastebin. Aplikasi ini memungkinkan pengguna untuk membuat, mengedit, dan berbagi daftar tugas tanpa perlu login. Dihasilkan dengan vibe coding menggunakan Cursor.ai.

🚀 **Demo**: [https://todo-list-pastebin.vercel.app/](https://todo-list-pastebin.vercel.app/)

![Todo List Pastebin Screenshot](docs/screenshot.png)

## Fitur

- **Pembuatan Daftar Tugas**: Buat daftar tugas tanpa perlu mendaftar atau login
- **Berbagi Daftar**: Bagikan daftar tugas via URL unik yang dihasilkan setelah pembuatan
- **Kolaborasi Real-time**: Bekerja sama dengan anggota tim secara real-time melalui WebSocket
- **Daftar Otomatis Kedaluwarsa**: Daftar tugas akan otomatis terhapus setelah periode waktu tertentu
- **Antarmuka Drag-and-drop**: Susun ulang tugas dengan mudah menggunakan interaksi drag-and-drop
- **UI Modern**: Tampilan modern dan responsif dengan Tailwind CSS
- **No Login Required**: Akses dan edit daftar tugas menggunakan token yang dibagikan
- **Multi-backend Support**: Dukungan untuk backend Go dengan Redis atau Supabase dengan PostgreSQL

## Tech Stack

### Backend

- **Go 1.21** (Opsional): Bahasa pemrograman backend dengan Redis
- **Fiber**: Framework web yang cepat dan ringan
- **Redis**: Database untuk penyimpanan daftar tugas
- **WebSocket**: Untuk pembaruan real-time
- **Supabase** (Opsional): Backend-as-a-Service dengan PostgreSQL dan autentikasi

### Frontend

- **Next.js 14**: Framework React dengan server-side rendering
- **TypeScript**: Bahasa pemrograman yang diketik statis
- **TailwindCSS**: Framework CSS yang utility-first
- **React DnD**: Library untuk drag-and-drop
- **Axios**: Untuk API request

## Struktur Proyek

```
todo-list-app/
├── backend/                # Kode backend Go (opsional)
│   ├── api/                # Handler API dan middleware
│   ├── config/             # Konfigurasi aplikasi
│   ├── models/             # Model data
│   ├── websocket/          # Implementasi WebSocket
│   └── main.go             # Entry point aplikasi
├── frontend/               # Kode frontend Next.js
│   ├── public/             # Aset statis
│   ├── src/
│   │   ├── app/            # Komponen Next.js App Router
│   │   ├── components/     # Komponen React reusable
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Library dan utilities
│   │   ├── services/       # Layanan API (Go dan Supabase)
│   │   └── types/          # Type definitions TypeScript
│   ├── .env.local.example  # Template konfigurasi lingkungan
│   └── package.json        # Dependensi frontend
├── supabase/               # Konfigurasi dan migrasi Supabase
├── docs/                   # Dokumentasi proyek
│   ├── api-examples.md     # Contoh penggunaan API
│   ├── installation-guide.md # Panduan instalasi
│   ├── CHANGELOG.md        # Log perubahan
│   └── contributing.md     # Panduan kontribusi
└── README.md               # Dokumentasi proyek
```

## Perubahan Terbaru

**Versi 1.1.0**

- Integrasi dengan Supabase sebagai backend alternatif
- Factory pattern untuk memilih provider backend
- Perbaikan bug pada penanganan item baru dengan ID temporary
- Lihat [CHANGELOG.md](docs/CHANGELOG.md) untuk rincian lengkap

## Pemilihan Backend

Aplikasi ini mendukung dua backend:

1. **Go Backend (Default)** - Backend asli berbasis Go dengan Redis
2. **Supabase Backend** - Backend alternatif menggunakan Supabase dengan PostgreSQL

Untuk mengubah backend yang digunakan, set environment variable `NEXT_PUBLIC_BACKEND_PROVIDER`:

```
# Untuk Go Backend (default)
NEXT_PUBLIC_BACKEND_PROVIDER=go

# Untuk Supabase Backend
NEXT_PUBLIC_BACKEND_PROVIDER=supabase
```

## Instalasi dan Setup

Lihat [docs/installation-guide.md](docs/installation-guide.md) untuk instruksi detail.

### Prasyarat

- Go 1.21 atau lebih tinggi (jika menggunakan backend Go)
- Node.js 18 atau lebih tinggi
- NPM atau Yarn
- Redis (jika menggunakan backend Go)
- Akun Supabase (jika menggunakan backend Supabase)

### Panduan Cepat

1. Clone repository
2. Setup backend (Go atau Supabase)
3. Setup frontend:

```bash
cd frontend
npm install
   # Konfigurasi .env.local
npm run dev
```

4. Buka http://localhost:3000

## Penggunaan

### Membuat Daftar Tugas

1. Buka aplikasi di browser
2. Isi daftar tugas yang ingin dibuat
3. Pilih waktu kedaluwarsa daftar (1 jam, 1 hari, 1 minggu)
4. Klik "Create Todo List"
5. Anda akan diarahkan ke halaman edit daftar dengan URL unik

### Berbagi Daftar Tugas

1. Gunakan URL yang dihasilkan untuk berbagi daftar tugas
2. Tambahkan parameter `?token=[edit_token]` untuk memberikan akses edit
3. Tanpa token, daftar hanya dapat dilihat (read-only)

### Mengedit Daftar Tugas

1. Gunakan URL dengan token untuk mengedit daftar
2. Tambahkan tugas baru dengan tombol "Add Task"
3. Tandai tugas selesai dengan mengklik checkbox
4. Atur ulang urutan tugas dengan drag-and-drop
5. Ubah isi tugas dengan mengklik teks tugas
6. Hapus tugas dengan ikon hapus

## API Endpoints

Lihat [docs/api-examples.md](docs/api-examples.md) untuk dokumentasi API lengkap.

## Troubleshooting

Lihat [docs/installation-guide.md](docs/installation-guide.md) untuk panduan troubleshooting umum.

## Kontribusi

Lihat [docs/contributing.md](docs/contributing.md) untuk informasi tentang cara berkontribusi pada proyek ini.

---

Dibuat dengan ❤️ oleh Bhakti Utama
