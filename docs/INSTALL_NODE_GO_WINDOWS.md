# Panduan Instalasi Node.js dan Go (Golang) di Windows

Dokumen ini berisi panduan langkah demi langkah untuk menginstal **Node.js** (dibutuhkan untuk menjalankan environment Frontend) dan **Go / Golang** (dibutuhkan untuk menjalankan API Backend) pada sistem operasi Windows.

---

## 1. Instalasi Node.js

Node.js digunakan untuk menjalankan environment JavaScript di luar browser. Bersamaan dengan Node.js, `npm` (Node Package Manager) juga akan ikut terinstal untuk mengelola dependensi project frontend.

### Langkah-langkah Instalasi:
1. Buka browser dan kunjungi situs resmi Node.js: [https://nodejs.org/](https://nodejs.org/)
2. Unduh versi **LTS (Long Term Support)** (biasanya tombol sebelah kiri). Versi LTS sangat direkomendasikan karena lebih stabil untuk pengembangan.
3. Setelah selesai diunduh, buka file installer `.msi` tersebut.
4. Ikuti wizard instalasi:
   - Klik **Next**.
   - Centang persetujuan lisensi (Accept License Agreement), lalu klik **Next**.
   - Biarkan path instalasi default (biasanya di `C:\Program Files\nodejs\`), klik **Next**.
   - Pada layar **Custom Setup**, pastikan "Node.js runtime", "npm package manager", dan "Add to PATH" terpilih. Biarkan default lalu klik **Next**.
   - (Opsional) Pada bagian "Tools for Native Modules", Anda bisa melewatinya (tidak dicentang) kecuali Anda tahu butuh mengkompilasi module C/C++, lalu klik **Next**.
   - Klik **Install** dan tunggu hingga selesai.
   - Klik **Finish**.

### Verifikasi Instalasi:
1. Buka terminal baru (**Command Prompt** atau **PowerShell**).
2. Jalankan perintah berikut untuk melihat versi Node.js:
   ```cmd
   node -v
   ```
3. Jalankan perintah berikut untuk melihat versi npm:
   ```cmd
   npm -v
   ```
> Jika terminal mengembalikan nomor versi (contoh: `v20.x.x`), berarti Node.js berhasil diinstal dan siap digunakan.

---

## 2. Instalasi Go (Golang)

Go adalah bahasa pemrograman kompilasi yang digunakan untuk membuat program backend.

### Langkah-langkah Instalasi:
1. Kunjungi halaman download resmi Go: [https://go.dev/dl/](https://go.dev/dl/)
2. Pilih installer untuk Microsoft Windows (biasanya bernama `go1.x.x.windows-amd64.msi`).
3. Setelah unduhan selesai, jalankan installer `.msi` tersebut.
4. Ikuti wizard instalasi:
   - Klik **Next**.
   - Terima persetujuan lisensi, lalu klik **Next**.
   - Biarkan folder instalasi default (biasanya di `C:\Program Files\Go\`), lalu klik **Next**.
   - Klik **Install** dan izinkan (bila muncul prompt Administrator).
   - Setelah selesai, klik **Finish**.
> *Catatan: Installer Go secara otomatis akan mendaftarkan command `go` ke dalam environment variabel `PATH` komputer Anda.*

### Verifikasi Instalasi:
1. Buka kembali aplikasi **Command Prompt** atau **PowerShell** Anda. *(Penting: jika sebelumnya sudah terbuka, Anda harus menutup dan membukanya kembali agar mendeteksi PATH yang baru)*.
2. Jalankan perintah berikut:
   ```cmd
   go version
   ```
> Jika muncul teks berisi versi Go (contoh: `go version go1.22.x windows/amd64`), maka instalasi berhasil.

---

## Alternatif Instalasi (Menggunakan Chocolatey)

Bagi Anda yang sudah terbiasa menggunakan command line dan memiliki [Chocolatey](https://chocolatey.org/) terinstal di Windows, proses instalasi bisa dilakukan dengan jauh lebih praktis.

1. Buka **PowerShell** dengan mode Administrator (Run as Administrator).
2. Jalankan perintah instalasi Node.js LTS:
   ```powershell
   choco install nodejs-lts -y
   ```
3. Jalankan perintah instalasi Golang:
   ```powershell
   choco install golang -y
   ```
4. Selesai. (Pastikan untuk merestart terminal/PowerShell agar variabel sistemnya diperbarui).
