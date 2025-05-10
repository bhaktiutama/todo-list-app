# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [2.0.1] - 2024-03-22

### Changed

- Memindahkan trending tags dari sidebar ke area konten utama antara form create dan search
- Menyesuaikan warna border card dengan form create (border-white/20)
- Menyederhanakan struktur layout untuk menghindari double scroll
- Meningkatkan konsistensi visual antara halaman utama dan edit todo list
- Mengubah perilaku tombol Duplicate List agar selalu tampil tapi disabled di halaman utama
- Memperbaiki styling tombol Duplicate List saat disabled dengan opacity dan cursor not-allowed
- Memperbaiki pesan tooltip pada tombol Duplicate List sesuai konteks halaman
- Meningkatkan visual feedback loading indicator dengan padding yang lebih konsisten

### Fixed

- Memperbaiki infinite scroll pada halaman utama dengan mengubah event listener dari div ke window
- Memperbaiki layout container utama untuk mendukung scrolling yang lebih baik
- Menambahkan padding bottom yang lebih besar (pb-20) untuk area loading

## [2.0.0] - 2024-03-20

### Added

- Fitur view count untuk menampilkan jumlah pengunjung unik
- Fitur like untuk memungkinkan pengguna memberikan apresiasi
- Integrasi fingerprint untuk mencegah duplikasi view dan like
- Fitur drag and drop untuk pengurutan item todo
- Tombol dan fungsi duplikasi todo list dengan expiry 24 jam
- Menambahkan navbar dengan navigasi ke halaman About dan Privacy Policy
- Menambahkan halaman About dengan informasi tentang aplikasi dan pengembang
- Menambahkan halaman Privacy Policy dengan kebijakan privasi pengguna
- Menambahkan tautan GitHub repository pada navbar

### Changed

- Memperbarui tampilan notifikasi dengan animasi fade-in-up
- Memperbaiki tampilan share links dengan desain yang lebih modern
- Menambahkan visual feedback saat proses copy link berhasil
- Memperbarui tampilan progress task dengan format yang lebih ringkas
- Menambahkan ikon pada input URL untuk meningkatkan visual feedback
- Menambahkan logo aplikasi pada navbar dengan dukungan tema terang dan gelap
- Mengimplementasikan logo yang berbeda untuk mode terang (`logo.png`) dan gelap (`logo-dark.png`)
- Meningkatkan layout aplikasi dengan menambahkan fixed navbar dan proper spacing
- Migrasi penuh ke Supabase sebagai satu-satunya backend
- Penghapusan backend Golang dan WebSocket
- Penyederhanaan arsitektur aplikasi dengan menghapus multi-backend support
- Peningkatan performa sinkronisasi data menggunakan polling

### Removed

- Menghapus indikator pill auto-saving untuk antarmuka yang lebih bersih
- Backend Golang dan semua komponennya
- Implementasi WebSocket untuk real-time updates
- Environment variables terkait Golang dan WebSocket
- Factory pattern untuk pemilihan backend

## [1.2.0] - 2024-03-19

### Added

- Fitur auto-focus pada item pertama saat membuat todo list baru
- Fitur membuat task baru otomatis saat menekan Enter dengan auto-focus
- Fitur navigasi antar task menggunakan Enter di mode edit
- Fitur sistem prioritas pada task: indikator pill, selector, dan integrasi penuh pada halaman create dan edit
- Sistem penandaan (tagging): kemampuan menambahkan, menghapus, dan memfilter berdasarkan tag pada todo list

### Fixed

- Memperbaiki urutan pengurutan berdasarkan prioritas agar diurutkan dari high, medium, baru low

### Changed

- Memperbaiki tampilan indikator auto-saving agar hanya muncul pada mode edit
- Meningkatkan perilaku sinkronisasi agar tetap berjalan pada mode edit dengan mencegah konflik perubahan lokal
- Memperbarui struktur database dengan relasi tag pada level todo list, bukan pada level item individu
- Memperbaiki sinkronisasi tag untuk memastikan perubahan tag tetap tersimpan dengan benar
- Membatasi jumlah tag maksimum menjadi 4 per todo list untuk menjaga performa dan keterbacaan
- Memperpendek label prioritas "Medium" menjadi "Med" agar tampilan lebih ringkas

## [1.1.0] - 2024-03-16

### Added

- Sistem prioritas untuk task
- Komponen PriorityIndicator dan PrioritySelector
- Integrasi prioritas pada halaman create dan edit
- Migrasi database untuk kolom priority

### Changed

- Perbaikan tampilan PrioritySelector
- Peningkatan UX dengan indikator prioritas yang lebih jelas

### Fixed

- Penanganan undefined item ID
- Bug pada tampilan dark mode

## [1.0.0] - 2023-07-15

### Added

- Versi awal aplikasi Todo List
- Berbagi daftar tugas melalui URL unik
- Otentikasi sederhana dengan token edit
- Websocket untuk pembaruan real-time
- Expiry untuk todo list
