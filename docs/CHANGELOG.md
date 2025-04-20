# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [Unreleased]

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

## [1.1.0] - 2023-08-20

### Added

- Integrasi dengan Supabase sebagai alternatif backend
- Dukungan multi-user pada daftar tugas
- Sistem factory pattern untuk mendukung beberapa backend API

### Fixed

- Memperbaiki masalah menambah item baru dengan ID temporary
- Memperbaiki error ketika mencentang item dalam daftar tugas
- Memperbaiki handling ID item yang undefined
- Memperbaiki urutan pengurutan berdasarkan prioritas agar diurutkan dari high, medium, baru low

### Changed

- Restrukturisasi API service dengan pendekatan yang lebih modular
- Memperbarui komponen TodoList untuk menggunakan API abstraksi

## [1.0.0] - 2023-07-15

### Added

- Versi awal aplikasi Todo List
- Berbagi daftar tugas melalui URL unik
- Otentikasi sederhana dengan token edit
- Websocket untuk pembaruan real-time
- Expiry untuk todo list
