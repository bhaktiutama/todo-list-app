# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [Unreleased]

## [1.1.0] - 2023-08-20

### Added

- Integrasi dengan Supabase sebagai alternatif backend
- Implementasi Row Level Security (RLS) untuk keamanan data
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
- Fitur drag-and-drop untuk menyusun ulang tugas
- Berbagi daftar tugas melalui URL unik
- Otentikasi sederhana dengan token edit
- Websocket untuk pembaruan real-time
- Expiry untuk todo list
