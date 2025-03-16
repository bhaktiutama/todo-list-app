# Panduan Instalasi Todo List Pastebin

Dokumen ini berisi instruksi langkah demi langkah untuk menginstal dan menjalankan aplikasi Todo List Pastebin, baik untuk pengembangan maupun untuk produksi.

## Prasyarat

1. **Go** - versi 1.21 atau lebih tinggi

   - Download: [https://golang.org/dl/](https://golang.org/dl/)
   - Verifikasi instalasi: `go version`

2. **Node.js** - versi 18 atau lebih tinggi

   - Download: [https://nodejs.org/](https://nodejs.org/)
   - Verifikasi instalasi: `node -v`

3. **Redis** - untuk penyimpanan data

   - Linux: `sudo apt-get install redis-server`
   - macOS: `brew install redis`
   - Windows: Gunakan Redis Windows atau WSL
   - Verifikasi instalasi: `redis-cli ping` (harus mengembalikan "PONG")

4. **Git** - untuk clone repository
   - Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Verifikasi instalasi: `git --version`

## Setup untuk Pengembangan

### Konfigurasi Backend (Go)

1. **Clone repository**

   ```bash
   git clone https://github.com/yourusername/todo-list-app.git
   cd todo-list-app
   ```

2. **Persiapkan backend**

   ```bash
   cd backend
   ```

3. **Instal dependensi Go**

   ```bash
   go mod download
   go mod tidy
   ```

4. **Setup konfigurasi lingkungan**

   Buat file `.env` di folder `backend`:

   ```
   REDIS_URL=localhost:6379
   REDIS_PASSWORD=
   PORT=8080
   CORS_ORIGIN=http://localhost:3000
   WEBSOCKET_ENABLED=true
   ENVIRONMENT=development
   LOG_LEVEL=info
   ```

5. **Instalasi Air (opsional untuk hot reload)**

   ```bash
   # Menggunakan Homebrew (macOS)
   brew install cosmtrek/tools/air

   # Menggunakan Go
   go install github.com/cosmtrek/air@latest
   ```

   Buat file `.air.toml` di folder `backend` (jika belum ada):

   ```toml
   root = "."
   tmp_dir = "tmp"

   [build]
   cmd = "go build -o ./tmp/main ."
   bin = "./tmp/main"
   include_ext = ["go", "tpl", "tmpl", "html"]
   exclude_dir = ["assets", "tmp", "vendor"]
   delay = 1000 # ms

   [screen]
   clear_on_rebuild = true
   ```

6. **Jalankan backend**

   ```bash
   # Dengan hot reload (jika air terinstal)
   air

   # Atau jalankan langsung
   go run main.go
   ```

   Server akan berjalan di http://localhost:8080

### Konfigurasi Frontend (Next.js)

1. **Masuk ke direktori frontend**

   ```bash
   cd ../frontend
   ```

2. **Instal dependensi Node.js**

   ```bash
   npm install
   # atau jika menggunakan yarn
   yarn install
   ```

3. **Setup konfigurasi lingkungan**

   Buat file `.env.local` di folder `frontend`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_ENABLE_WEBSOCKET=true
   NEXT_PUBLIC_DEBUG=true
   ```

4. **Jalankan server pengembangan**

   ```bash
   npm run dev
   # atau jika menggunakan yarn
   yarn dev
   ```

   Aplikasi akan berjalan di http://localhost:3000

## Troubleshooting Umum

### Redis Connection Failed

Jika mendapatkan error koneksi Redis:

1. Periksa status Redis:

   ```bash
   # macOS/Linux
   systemctl status redis
   # atau
   redis-cli ping
   ```

2. Tinjau log Redis:

   ```bash
   # macOS/Linux
   tail -f /var/log/redis/redis-server.log
   ```

3. Coba ganti URL Redis di file `.env` dengan IP eksplisit:
   ```
   REDIS_URL=127.0.0.1:6379
   ```

### CORS Errors

Jika mendapatkan CORS errors di browser:

1. Pastikan `CORS_ORIGIN` di `.env` backend sesuai dengan URL frontend:

   ```
   CORS_ORIGIN=http://localhost:3000
   ```

2. Untuk development, Anda bisa mengaktifkan wildcard origins:
   ```
   CORS_ORIGIN=*
   ```

### WebSocket Tidak Tersambung

Jika WebSocket tidak tersambung:

1. Periksa browser console untuk pesan error
2. Pastikan `NEXT_PUBLIC_ENABLE_WEBSOCKET=true` di frontend dan `WEBSOCKET_ENABLED=true` di backend
3. Periksa firewall atau proxy yang mungkin memblokir koneksi WebSocket

## Setup untuk Produksi

### Backend (Go)

1. **Build binary**

   ```bash
   cd backend
   go build -o main .
   ```

2. **Deploy binary dan file .env ke server**

3. **Konfigurasi produksi**

   Edit `.env` untuk produksi:

   ```
   REDIS_URL=your-redis-server:6379
   REDIS_PASSWORD=your-redis-password
   PORT=8080
   CORS_ORIGIN=https://your-frontend-domain.com
   WEBSOCKET_ENABLED=true
   ENVIRONMENT=production
   LOG_LEVEL=error
   ```

4. **Jalankan dengan process manager (contoh dengan PM2)**
   ```bash
   pm2 start ./main --name todo-backend
   ```

### Frontend (Next.js)

1. **Build frontend**

   ```bash
   cd frontend
   npm run build
   # atau
   yarn build
   ```

2. **Konfigurasi produksi**

   Edit `.env.production` untuk produksi:

   ```
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   NEXT_PUBLIC_ENABLE_WEBSOCKET=true
   ```

3. **Deploy ke platform hosting**
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - Atau deploy folder `out` ke server web Anda

## Pemeliharaan

### Backup Data Redis

```bash
# Membuat backup
redis-cli SAVE
# atau
redis-cli BGSAVE

# Lokasi file dump.rdb biasanya:
# - Linux: /var/lib/redis/dump.rdb
# - macOS (Homebrew): /usr/local/var/db/redis/dump.rdb
```

### Monitoring

1. **Redis monitoring**

   ```bash
   redis-cli monitor
   ```

2. **Backend logs**

   Jika menggunakan PM2:

   ```bash
   pm2 logs todo-backend
   ```

## Keamanan

1. **Selalu gunakan HTTPS di produksi**
2. **Pasang rate-limiting untuk API**
3. **Tetapkan masa kedaluwarsa Redis yang wajar untuk mencegah pertumbuhan database**
4. **Pertimbangkan untuk menambahkan CAPTCHA untuk pembuatan daftar tugas jika menghadapi spam**

## Panduan Upgrade

### Backend

1. Pull perubahan terbaru: `git pull`
2. Update dependensi: `go mod tidy`
3. Build binary baru: `go build -o main .`
4. Restart service: `pm2 restart todo-backend`

### Frontend

1. Pull perubahan terbaru: `git pull`
2. Update dependensi: `npm install` atau `yarn install`
3. Build ulang: `npm run build` atau `yarn build`
4. Deploy ulang ke platform hosting
