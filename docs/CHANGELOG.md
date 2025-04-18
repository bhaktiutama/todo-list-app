# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [Unreleased]

### Added

- Fitur auto-focus pada item pertama saat membuat todo list baru
- Fitur membuat task baru otomatis saat menekan Enter dengan auto-focus
- Fitur navigasi antar task menggunakan Enter di mode edit
- Fitur sistem prioritas pada task: indikator pill, selector, dan integrasi penuh pada halaman create dan edit

### Changed

- Memperbaiki tampilan indikator auto-saving agar hanya muncul pada mode edit
- Meningkatkan perilaku sinkronisasi agar tetap berjalan pada mode edit dengan mencegah konflik perubahan lokal

## [1.1.0] - 2023-08-20

### Added

- Integrasi dengan Supabase sebagai alternatif backend
- Dukungan multi-user pada daftar tugas
- Sistem factory pattern untuk mendukung beberapa backend API

### Fixed

- Memperbaiki masalah menambah item baru dengan ID temporary
- Memperbaiki error ketika mencentang item dalam daftar tugas
- Memperbaiki handling ID item yang undefined

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
