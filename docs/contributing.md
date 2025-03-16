# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada proyek Todo List Pastebin! Dokumen ini berisi informasi tentang cara berkontribusi, standar kode, dan proses pull request.

## Persiapan

1. **Fork repository** di GitHub.
2. **Clone repository** ke komputer Anda:
   ```bash
   git clone https://github.com/yourusername/todo-list-app.git
   cd todo-list-app
   ```
3. **Tambahkan upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalusername/todo-list-app.git
   ```
4. **Buat branch baru** untuk fitur atau perbaikan Anda:
   ```bash
   git checkout -b feature/nama-fitur
   # atau
   git checkout -b fix/nama-perbaikan
   ```

## Lingkungan Pengembangan

Ikuti panduan instalasi di [docs/installation-guide.md](installation-guide.md) untuk menyiapkan lingkungan pengembangan.

## Standar Kode

### Go (Backend)

1. **Formatting**:

   - Gunakan `gofmt` atau `goimports` untuk memformat kode.
   - Jalankan: `go fmt ./...` sebelum commit.

2. **Linting**:

   - Gunakan `golint` dan `go vet` untuk memeriksa kode.
   - Jalankan: `golint ./...` dan `go vet ./...` sebelum commit.

3. **Testing**:

   - Tulis unit test untuk kode baru.
   - Pastikan semua test lulus: `go test ./...`

4. **Penanganan Error**:

   - Selalu periksa dan tangani error.
   - Gunakan log level yang sesuai untuk error.

5. **Dokumentasi**:
   - Tambahkan komentar untuk fungsi publik mengikuti standar GoDoc.

### TypeScript/JavaScript (Frontend)

1. **Formatting**:

   - Gunakan Prettier untuk memformat kode.
   - Jalankan: `npm run format` sebelum commit.

2. **Linting**:

   - Gunakan ESLint untuk memeriksa kode.
   - Jalankan: `npm run lint` sebelum commit.

3. **Testing**:

   - Tulis unit test untuk komponen React.
   - Pastikan semua test lulus: `npm run test`

4. **Nama Komponen**:

   - Gunakan PascalCase untuk nama komponen React.
   - Gunakan camelCase untuk fungsi dan variabel.

5. **CSS/Styling**:
   - Gunakan Tailwind CSS class sesuai dengan desain sistem.
   - Hindari inline CSS kecuali sangat diperlukan.

## Proses Kontribusi

### Langkah-langkah

1. **Perbarui branch Anda** dengan perubahan terbaru dari upstream:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Implementasikan perubahan** Anda.

3. **Commit perubahan** Anda dengan pesan commit yang jelas:

   ```bash
   git add .
   git commit -m "Jenis: Deskripsi singkat perubahan"
   ```

   Jenis commit:

   - `feat`: Fitur baru
   - `fix`: Perbaikan bug
   - `docs`: Perubahan dokumentasi
   - `style`: Perubahan format (tidak mengubah kode)
   - `refactor`: Refaktor kode
   - `test`: Menambah atau memperbaiki test
   - `chore`: Perubahan build atau tooling

4. **Push ke repository** Anda:

   ```bash
   git push origin feature/nama-fitur
   ```

5. **Buat Pull Request** di GitHub.

### Deskripsi Pull Request

Saat membuat Pull Request, sertakan:

1. **Deskripsi** singkat tentang perubahan yang Anda buat.
2. **Issue terkait** (jika ada) dengan format "Resolves #123".
3. **Screenshot** untuk perubahan UI (jika ada).
4. **Langkah pengujian** untuk memverifikasi perubahan.

## Menambahkan Fitur Baru

Jika Anda ingin menambahkan fitur baru yang signifikan:

1. **Buka Issue terlebih dahulu** untuk mendiskusikan fitur tersebut.
2. **Buat desain tingkat tinggi** dan jelaskan implementasi yang diusulkan.
3. **Tunggu persetujuan** dari maintainer sebelum mulai mengimplementasikan.

## API dan Struktur Data

### Menambahkan Endpoint API Baru (Backend)

1. Tambahkan handler baru di `backend/api/handlers.go`.
2. Daftarkan rute di `backend/api/routes.go`.
3. Tambahkan model data yang diperlukan di `backend/models/`.
4. Dokumentasikan endpoint di `docs/api-examples.md`.

### Menambahkan Komponen UI Baru (Frontend)

1. Buat file komponen di `frontend/src/components/`.
2. Tambahkan type definitions di `frontend/src/types/`.
3. Uji komponen dengan unit test.
4. Integrasikan dengan komponen lain sesuai kebutuhan.

## Proyek Roadmap

Kami selalu mencari kontribusi untuk area berikut:

1. **Peningkatan UI/UX**:

   - Tema gelap/terang
   - Aksesibilitas
   - Mobile responsiveness

2. **Performa**:

   - Optimasi query Redis
   - Caching di frontend

3. **Fitur Baru**:

   - Subtasks
   - Labels/tags
   - Due dates
   - Prioritas tugas

4. **Infrastruktur**:
   - CI/CD improvements
   - Containerization
   - Deployment scripts

## Kebijakan Perilisan

1. **Versioning** mengikuti [Semantic Versioning](https://semver.org/).
2. **Release notes** akan mencantumkan semua perubahan yang tercakup.
3. **Breaking changes** akan diumumkan sebelumnya jika memungkinkan.

## Kontak

Jika Anda memiliki pertanyaan atau butuh bantuan:

- **GitHub Issues**: Buka issue baru dengan tag "question".
- **Email**: Hubungi maintainer di email@example.com.

## Code of Conduct

Proyek ini mengadopsi [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Harap mematuhi aturan ini dalam semua interaksi Anda dengan proyek.

---

Terima kasih telah berkontribusi ke Todo List Pastebin!
