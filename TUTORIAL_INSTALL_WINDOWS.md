# Tutorial Instalasi CMWI Docker di Windows

Panduan ini ditujukan bagi programmer atau pengguna yang ingin melakukan deploy dan testing aplikasi CMWI secara lokal di sistem operasi Windows agar dapat diakses baik oleh komputer itu sendiri maupun oleh perangkat lain dalam satu jaringan (Wi-Fi/LAN).

---

## Tahap 1: Persiapan Dasar PC Server

### 1. Aktifkan Virtualization di BIOS Windows
Agar platform Docker dan WSL bisa berjalan sempurna, fitur Virtualisasi pada prosesor wajib diaktifkan:
1. Matikan atau _Restart_ komputer Anda.
2. Saat komputer baru saja menyala sebelum masuk logo Windows, segera tekan tombol masuk BIOS berulang-ulang (Biasanya `F2`, `F10`, `Delete`, atau `Esc`).
3. Cari menu bernama **Advanced**, **CPU Configuration**, atau **Security**.
4. Cari opsi **Intel Virtualization Technology**, **VT-x** (jika prosesor Intel), atau **SVM Mode**, **AMD-V** (jika prosesor AMD).
5. Ubah nilainya menjadi **Enabled**.
6. Simpan konfigurasi tekan `F10` (Save and Exit). Komputer akan melakukan restart ke Windows.

---

## Tahap 2: Instalasi Komponen & Konfigurasi Eksternal

### 1. Install WSL (Windows Subsystem for Linux)
1. Klik Start Menu (Tombol Windows) lalu ketik **PowerShell**.
2. Klik kanan program tersebut, dan wajib tekan: **Run as Administrator**.
3. Ketikkan perintah ini dan tekan Enter:
   ```powershell
   wsl --install
   ```
4. Tunggu instruksinya sampai usai, lalu restart laptop/komputer Anda jika diperlukan.

### 2. Install Docker Desktop
1. Download installer file Docker Desktop di [Website Resmi Docker](https://www.docker.com/products/docker-desktop/).
2. Lakukan instalasi layaknya menginstall aplikasi pada umumnya (Next - Next). Pastikan opsi pembantu **"Use WSL 2"** ter-centang.
3. Buka aplikasi Docker Desktop seusai diinstall, setujui halaman terms, lalu pastikan ikon aplikasi menyala berwarna "Hijau" di bagian bar bawah kiri.

### 3. Ketahui IP Komputer 
Perangkat/HP lain membutuhkan "koordinat" tujuan IP komputer Anda agar bisa mengakses server web.
1. Buka Terminal / CMD Windows.
2. Ketik perintah: 
   ```cmd
   ipconfig
   ```
3. Lihat bagian **IPv4 Address** yang bertuliskan deret angka IP, misalnya `192.168.0.106` (*Catatan: Koordinat ini bisa merubah dari waktu ke waktu sesuai pembagian WiFi Router*).

### 4. Atur File Lingkungan (`.env`)
1. Buka File `.env` yang berada di dalam folder project VSCode CMWI.
2. Sesuaikan paramaternya sebagai berikut supaya menggunakan Port dan Domain web default lokal:
   ```env
   SERVER_IP=192.168.0.106
   APP_DOMAIN=qc.cmwi.local
   NGINX_PORT=443
   NGINX_HTTP_PORT=80
   APP_URL=https://qc.cmwi.local
   ```

---

## Tahap 3: Konfigurasi Jaringan & Firewall 

Ketika PC / Server Windows dihubungi oleh HP pihak eksternal, firewall sistem bawaan akan otomatis menolak. Bukalah gerbang jalur koneksi ini dengan cara:

### Cara Buka Firewall Otomatis Melalui PowerShell
1. Buka **PowerShell** dan jalankan sebagai **Administrator**.
2. Eksekusi (*Copy - Hit Enter*) perintah ini:
   ```powershell
   New-NetFirewallRule -DisplayName "Allow CMWI Inbound" -Direction Inbound -LocalPort 80,443 -Protocol TCP -Action Allow
   ```

### Cara Buka Firewall Manual Lewat Tampilan
*Jika cara otomatis di atas gagal, lakukan ini:*
1. Buka Start Menu -> ketik `Windows Defender Firewall`.
2. Klik Menu barisan kiri nomor dua: **Advanced settings**.
3. Di panel sebelah kiri klik **Inbound Rules**.
4. Di panel sebelah kanan menu atas klik **New Rule**.
5. Pilih bulatan **Port** -> Next.
6. Pastikan opsi **TCP** dan isi Specific local port dengan format: `80, 443` -> Next.
7. Pilih posisi **Allow the connection** -> Next.
8. Centang kotak tiga hal (Domain, Private, Public) -> Next.
9. Beri nama aturan (misal: Bebas Inbound CMWI) lalu tombol Finish.

---

## Tahap 4: Proses Build & Testing Container
1. Buka Terminal yang posisinya berada di direktori project kamu (tempat letak `docker-compose.yml` berada).
2. Nyalakan sistem aplikasi container Docker dengan merakit semuanya:
   ```cmd
   docker compose up -d --build
   ```
3. Tunggu hingga status kontainer bertuliskan `- Started` di terminal atau Hijau menyala.

---

## Tahap 5: Testing (Uji Coba Pengaksesan Web)

Berikut dua rute cara mengakesnya yang berbeda bedasarkan _Device_ tujuannya:

#### JIKA DI TES MELALUI PERANGKAT LAIN (Bukan PC Ini) 📱💻
1. Ambil HP / Android / Safari iPhone / atau Laptop Teman kamu.
2. Sambungkan Wi-Fi ke hotspot provider / jaringan yang sama layaknya komputer ini.
3. Buka browser dan pergi ke IP address yang kamu ketahui tadi langsung (wajib letakan elemen awalan huruf HTTPS).
   ```text
   https://192.168.0.106
   ```
   > **Note Penting**: Jangan menuliskan "qc.cmwi.local" di address bar device lain tersebut karena device itu niscaya tidak mengetahui keberadaan domain buatan PC kamu. Hanya ketik nomor IP saja!

4. Lewati laman bahaya sertifikat merah SSL *(Your Connection is Not Private)*. Lalu pilih fitur abu-abu **Advanced** (lanjutan opsi), lalu teruskan/sistem **Proceed to Unsafe site**.

#### JIKA DI TES DI PC KOMPUTER INI SENDIRI 🖥️
PC server mu kebetulan "bisa" mengerti domain `qc.cmwi.local`, asalkan kamu memaksanya secara manual lewat file core hosts system Windows:
1. Cari aplikasi teks **Notepad**, klik kanan, pilih **Run as Administrator**.
2. Klik File -> Buka folder lintasan ini `C:\Windows\System32\drivers\etc\`.
3. Ganti dropdown pencarian dari .TXT menjadi ke "All Files".
4. Buka file hitam/putih bernama **`hosts`**.
5. Jangan rombak apapun, cukup arahkan cursor file ke pojok teks paling baris dasar.
6. Ketikkan pendaftaran DNS manual komputermu sendiri:
   ```txt
   127.0.0.1 qc.cmwi.local
   192.168.0.106 qc.cmwi.local
   ```
7. Pencet `Ctrl + S` simpan lalu tutup.
8. Sekarang kamu sudah siap dapat menggunakan `https://qc.cmwi.local` dan enter di Google Chrome/browser dalam PC server kamu ini.
