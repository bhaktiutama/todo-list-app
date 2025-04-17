# Panduan Instalasi Todo List Pastebin

Dokumen ini berisi instruksi langkah demi langkah untuk menginstal dan menjalankan aplikasi Todo List Pastebin, baik untuk pengembangan maupun untuk produksi.

## Prasyarat

1. **Go** - versi 1.21 atau lebih tinggi (untuk backend Go)

   - Download: [https://golang.org/dl/](https://golang.org/dl/)
   - Verifikasi instalasi: `go version`

2. **Node.js** - versi 18 atau lebih tinggi

   - Download: [https://nodejs.org/](https://nodejs.org/)
   - Verifikasi instalasi: `node -v`

3. **Redis** - untuk penyimpanan data (untuk backend Go)

   - Linux: `sudo apt-get install redis-server`
   - macOS: `brew install redis`
   - Windows: Gunakan Redis Windows atau WSL
   - Verifikasi instalasi: `redis-cli ping` (harus mengembalikan "PONG")

4. **Supabase Account** (opsional - jika menggunakan backend Supabase)

   - Daftar di [https://supabase.com/](https://supabase.com/)
   - Buat proyek baru

5. **Git** - untuk clone repository
   - Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Verifikasi instalasi: `git --version`

## Setup untuk Pengembangan

### Konfigurasi Backend (Go) - Opsional

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
   ```

5. **Jalankan backend**

   ```bash
   go run main.go
   ```

   Server akan berjalan di http://localhost:8080

### Konfigurasi Supabase Backend - Opsional

1. **Buat proyek Supabase baru**

   - Buka [https://app.supabase.com/](https://app.supabase.com/)
   - Klik "New Project"
   - Isi detail proyek dan create

2. **Buat tabel yang diperlukan**

   - Buka SQL Editor di dashboard Supabase
   - Jalankan SQL berikut:

   ```sql
   -- Buat tabel todo_lists
   CREATE TABLE public.todo_lists (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     edit_token TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
     expires_at TIMESTAMP WITH TIME ZONE NOT NULL
   );

   -- Buat tabel todo_items
   CREATE TABLE public.todo_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     todo_list_id UUID REFERENCES public.todo_lists(id) ON DELETE CASCADE NOT NULL,
     content TEXT NOT NULL,
     completed BOOLEAN DEFAULT false,
     order INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
     completed_at TIMESTAMP WITH TIME ZONE
   );
   ```

3. **Setup Row Level Security (RLS)**

   - Aktifkan RLS pada kedua tabel:

   ```sql
   -- Aktifkan RLS
   ALTER TABLE public.todo_lists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

   -- Buat kebijakan untuk todo_lists
   CREATE POLICY "Pengguna dapat melihat todo_lists mereka sendiri" ON public.todo_lists
   FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Pengguna dapat membuat todo_lists" ON public.todo_lists
   FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Pengguna dapat mengupdate todo_lists mereka sendiri" ON public.todo_lists
   FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Pengguna dapat menghapus todo_lists mereka sendiri" ON public.todo_lists
   FOR DELETE USING (auth.uid() = user_id);

   -- Buat kebijakan untuk todo_items
   CREATE POLICY "Pengguna dapat melihat todo_items dari todo_lists mereka" ON public.todo_items
   FOR SELECT USING (
     EXISTS (
       SELECT 1 FROM public.todo_lists
       WHERE todo_lists.id = todo_items.todo_list_id
       AND todo_lists.user_id = auth.uid()
     )
   );

   CREATE POLICY "Pengguna dapat membuat todo_items dalam todo_lists mereka" ON public.todo_items
   FOR INSERT WITH CHECK (
     EXISTS (
       SELECT 1 FROM public.todo_lists
       WHERE todo_lists.id = todo_items.todo_list_id
       AND todo_lists.user_id = auth.uid()
     )
   );

   CREATE POLICY "Pengguna dapat mengupdate todo_items dalam todo_lists mereka" ON public.todo_items
   FOR UPDATE USING (
     EXISTS (
       SELECT 1 FROM public.todo_lists
       WHERE todo_lists.id = todo_items.todo_list_id
       AND todo_lists.user_id = auth.uid()
     )
   );

   CREATE POLICY "Pengguna dapat menghapus todo_items dalam todo_lists mereka" ON public.todo_items
   FOR DELETE USING (
     EXISTS (
       SELECT 1 FROM public.todo_lists
       WHERE todo_lists.id = todo_items.todo_list_id
       AND todo_lists.user_id = auth.uid()
     )
   );
   ```

4. **Dapatkan API keys**
   - Di dashboard Supabase, buka "Project Settings" > "API"
   - Catat URL dan anon key untuk konfigurasi frontend

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
   # Untuk menggunakan backend Go
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_BACKEND_PROVIDER=go
   NEXT_PUBLIC_ENABLE_WEBSOCKET=true

   # Untuk menggunakan backend Supabase
   # NEXT_PUBLIC_BACKEND_PROVIDER=supabase
   # NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Untuk menggunakan Supabase, uncomment (hapus #) pada 3 baris terakhir dan isi dengan URL dan anon key dari proyek Supabase Anda.

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

### Temporary ID Error

Jika mengalami error saat menambahkan task baru:

```
invalid input syntax for type uuid: "temp-1234567890"
```

Hal ini terjadi karena saat menambahkan task baru, frontend membuat ID sementara yang tidak sesuai dengan format UUID yang diharapkan Supabase. Pastikan Anda menggunakan versi terbaru aplikasi yang telah memperbaiki masalah ini.

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
   ```

4. **Jalankan dengan process manager (contoh dengan PM2)**
   ```bash
   pm2 start ./main --name todo-backend
   ```

### Supabase Produksi

Untuk deployment produksi dengan Supabase:

1. **Pastikan RLS policies dikonfigurasi dengan benar**
2. **Pertimbangkan untuk mengaktifkan fitur backup data**
3. **Setup Supabase Edge Functions jika diperlukan untuk logika server**
4. **Catat URL produksi dan anon key untuk konfigurasi frontend**

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
   # Untuk backend Go
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   NEXT_PUBLIC_BACKEND_PROVIDER=go
   NEXT_PUBLIC_ENABLE_WEBSOCKET=true

   # Untuk backend Supabase
   # NEXT_PUBLIC_BACKEND_PROVIDER=supabase
   # NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
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
