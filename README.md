# Todo List Pastebin

Aplikasi Todo List yang dapat dibagikan, dibangun dengan Go dan Next.js, terinspirasi oleh Pastebin. Aplikasi ini memungkinkan pengguna untuk membuat, mengedit, dan berbagi daftar tugas tanpa perlu login. Dihasilkan dengan vibe coding menggunakan Cursor.ai.

![Todo List Pastebin Screenshot](docs/screenshot.png)

## Fitur

- **Pembuatan Daftar Tugas**: Buat daftar tugas tanpa perlu mendaftar atau login
- **Berbagi Daftar**: Bagikan daftar tugas via URL unik yang dihasilkan setelah pembuatan
- **Kolaborasi Real-time**: Bekerja sama dengan anggota tim secara real-time melalui WebSocket
- **Daftar Otomatis Kedaluwarsa**: Daftar tugas akan otomatis terhapus setelah periode waktu tertentu
- **Antarmuka Drag-and-drop**: Susun ulang tugas dengan mudah menggunakan interaksi drag-and-drop
- **UI Modern**: Tampilan modern dan responsif dengan Tailwind CSS
- **No Login Required**: Akses dan edit daftar tugas menggunakan token yang dibagikan

## Tech Stack

### Backend

- **Go 1.21**: Bahasa pemrograman backend
- **Fiber**: Framework web yang cepat dan ringan
- **Redis**: Database untuk penyimpanan daftar tugas
- **WebSocket**: Untuk pembaruan real-time

### Frontend

- **Next.js 14**: Framework React dengan server-side rendering
- **TypeScript**: Bahasa pemrograman yang diketik statis
- **TailwindCSS**: Framework CSS yang utility-first
- **React DnD**: Library untuk drag-and-drop
- **Axios**: Untuk API request

## Struktur Proyek

```
todo-list-app/
├── backend/                # Kode backend Go
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
│   │   ├── services/       # Layanan API
│   │   └── types/          # Type definitions TypeScript
│   ├── .env.local.example  # Template konfigurasi lingkungan
│   └── package.json        # Dependensi frontend
└── README.md               # Dokumentasi proyek
```

## Instalasi dan Setup

### Prasyarat

- Go 1.21 atau lebih tinggi
- Node.js 18 atau lebih tinggi
- NPM atau Yarn
- Redis (lokal atau remote)

### Clone Repository

```bash
git clone https://github.com/yourusername/todo-list-app.git
cd todo-list-app
```

### Setup Backend

1. Masuk ke direktori backend:

```bash
cd backend
```

2. Instal dependensi:

```bash
go mod download
```

3. Buat file `.env` berdasarkan `.env.example`:

```bash
# .env file
REDIS_URL=localhost:6379
REDIS_PASSWORD=
PORT=8080
CORS_ORIGIN=http://localhost:3000
WEBSOCKET_ENABLED=true
```

4. Jalankan backend:

```bash
go run main.go
```

Server backend akan berjalan di [http://localhost:8080](http://localhost:8080).

### Setup Frontend

1. Masuk ke direktori frontend:

```bash
cd frontend
```

2. Instal dependensi:

```bash
npm install
# atau
yarn install
```

3. Buat file `.env.local` berdasarkan `.env.local.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

4. Jalankan server pengembangan:

```bash
npm run dev
# atau
yarn dev
```

Aplikasi frontend akan berjalan di [http://localhost:3000](http://localhost:3000).

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

### Fitur Sinkronisasi Real-time

Jika WebSocket diaktifkan, perubahan pada daftar tugas akan otomatis disinkronkan ke semua pengguna yang membuka daftar tersebut tanpa perlu memuat ulang halaman.

## API Endpoints

### Backend API

| Endpoint            | Method    | Deskripsi                        | Parameter                   |
| ------------------- | --------- | -------------------------------- | --------------------------- |
| `/api/v1/todos`     | POST      | Membuat daftar tugas baru        | `expiration_hours`, `items` |
| `/api/v1/todos/:id` | GET       | Mendapatkan daftar tugas         | `id`                        |
| `/api/v1/todos/:id` | PUT       | Memperbarui daftar tugas         | `id`, `editToken`, `items`  |
| `/api/v1/ws/:id`    | WebSocket | Mendengarkan perubahan real-time | `id`, `clientId`            |

### Contoh Permintaan API

#### Membuat Todo List

```bash
curl -X POST http://localhost:8080/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{
    "expiration_hours": 24,
    "items": [
      {
        "content": "Beli bahan makanan",
        "completed": false,
        "order": 0
      },
      {
        "content": "Kerjakan project",
        "completed": false,
        "order": 1
      }
    ]
  }'
```

#### Mendapatkan Todo List

```bash
curl http://localhost:8080/api/v1/todos/[id]
```

#### Memperbarui Todo List

```bash
curl -X PUT http://localhost:8080/api/v1/todos/[id]?editToken=[token] \
  -H "Content-Type: application/json" \
  -d '{
    "id": "[id]",
    "title": "Daftar Tugas Saya",
    "items": [
      {
        "id": "item1",
        "content": "Beli bahan makanan",
        "completed": true,
        "order": 0
      }
    ]
  }'
```

## Troubleshooting

### Masalah Umum dan Solusi

1. **Redis Connection Failed**

   - Periksa apakah Redis berjalan: `redis-cli ping`
   - Pastikan URL dan password Redis benar di file `.env`

2. **WebSocket Tidak Tersambung**

   - Periksa apakah `NEXT_PUBLIC_ENABLE_WEBSOCKET=true` di frontend
   - Pastikan tidak ada CORS issues (domain frontend harus terdaftar di `CORS_ORIGIN` di backend)

3. **Perubahan Tidak Disimpan**

   - Periksa apakah editToken disertakan dalam URL atau permintaan API
   - Periksa log backend untuk pesan kesalahan validasi

4. **Changes Not Syncing in Real-time**
   - Periksa koneksi WebSocket di console browser
   - Pastikan `clientId` dikirimkan dengan benar saat menginisialisasi koneksi WebSocket

## Kontak

Jika Anda memiliki pertanyaan atau ingin berkontribusi, silakan buka issue di repository GitHub atau hubungi maintainer di bhakti.utama@gmail.com.

---

Dibuat dengan ❤️ oleh Bhakti Utama
