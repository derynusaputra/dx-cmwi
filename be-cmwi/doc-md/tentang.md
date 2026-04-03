Listed directory be-cmwi
Viewed README.md:1-162

Berdasarkan direktori `be-cmwi` yang Anda tanyakan, project ini adalah **REST API Backend untuk Aplikasi QC Patrol CMWI**.

Dari penamaan dan fiturnya, aplikasi ini tampaknya digunakan untuk sistem **Quality Control (QC) Patrol**, di mana operator/petugas melakukan pengecekan kualitas lapangan (terutama untuk proses pengecatan / _Painting_) dan melaporkan datanya ke dalam sistem beserta bukti foto/dokumen.

Berikut adalah rincian teknis dan fitur utama dari project backend ini:

### 🛠️ Tech Stack (Teknologi yang Digunakan)

- **Bahasa Pemrograman**: Golang (Go) 1.25+
- **Web Framework**: Gin (Framework HTTP yang sangat cepat untuk Go)
- **Database & ORM**: PostgreSQL database, diakses menggunakan _library_ GORM.
- **Keamanan**: JWT (JSON Web Tokens) untuk autentikasi (mendukung _access token_ & _refresh token_), dan `bcrypt` untuk enkripsi/hashing password pengguna.

### ⚙️ Fitur Utama (Berdasarkan Endpoints API)

1. **Sistem Autentikasi (`/auth`)**:
   - Mendukung registrasi, login, logout, dan pembaruan sesi via _refresh token_.
   - Memiliki sistem hak akses (role). Secara default _database seeder_ akan membuatkan 3 tipe user: **superadmin**, **admin**, dan **operator**.
2. **Data Inspeksi Pengecatan (`/painting-inspections`)**:
   - Sebagai inti aplikasinya, terdapat fitur CRUD (Create, Read, Update, Delete) untuk mencatat aktivitas "Painting Inspection".
   - Mendukung list inspeksi dengan _pagination_ dan pembaruan status inspeksi (contoh: _approved/rejected/pending_).
3. **Upload File (`/uploads`)**:
   - Memiliki fitur untuk menerima unggahan file, yang sangat berguna bagi petugas QC untuk mengunggah bukti foto atau dokumen dari hasil inspeksi lapangan. File yang diunggah akan disimpan di dalam folder lokal `uploads/`.

Backend ini juga sudah dikonfigurasi agar siap di-deploy secara modern, terbukti dengan adanya dukungan _Multi-stage Docker build_ (menggunakan `Dockerfile` dan `docker-compose.yml` di folder root-nya). Saat ini backend sedang Anda jalankan secara lokal (terlihat dari proses `go run .` yang sedang berjalan).
