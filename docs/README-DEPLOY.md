# Panduan Deploy CMWI di Docker (Windows / Linux)

Panduan ini menjelaskan cara deploy aplikasi CMWI menggunakan Docker agar semua karyawan di jaringan lokal bisa mengakses via **HTTPS**.

## Prasyarat

### Windows

1. **Windows 10/11 Pro atau Enterprise** (diperlukan untuk Hyper-V / WSL2)
2. **Docker Desktop for Windows** -- download di https://www.docker.com/products/docker-desktop/
3. Saat instalasi Docker Desktop, pastikan opsi **"Use WSL 2 based engine"** aktif
4. Setelah install, restart PC, lalu pastikan Docker Desktop berjalan (ikon whale di system tray)

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install docker.io docker-compose-v2 -y
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Logout dan login kembali setelah perintah di atas.

### Verifikasi Docker

```
docker --version
docker compose version
```

Jika kedua perintah menampilkan versi, Docker siap digunakan.

## Langkah Deploy

### 1. Copy Folder CMWI ke Server

Copy seluruh folder `CMWI/` ke PC server, contoh:
- **Windows:** `C:\Projects\CMWI`
- **Linux:** `~/CMWI`

Bisa menggunakan flash drive, network share (SMB), atau git clone.

### 2. Cek IP Address Server

**Windows:**
```
ipconfig
```

**Linux:**
```bash
ip addr
```

Catat **IPv4 Address**, contoh: `192.168.1.100`.

### 3. Edit File .env

Buka file `.env` di root folder `CMWI/`. Sesuaikan:

```env
# Ganti dengan IP server yang sebenarnya
SERVER_IP=192.168.1.100

# Domain custom (karyawan akses via nama ini)
APP_DOMAIN=qc.cmwi.local

# Port HTTPS dan HTTP
# Jika port 443/80 belum terpakai, gunakan default:
NGINX_PORT=443
NGINX_HTTP_PORT=80
# Jika sudah terpakai, gunakan port alternatif:
# NGINX_PORT=8443
# NGINX_HTTP_PORT=8880

# URL lengkap (sesuaikan port)
# Port 443: https://qc.cmwi.local
# Port 8443: https://qc.cmwi.local:8443
APP_URL=https://qc.cmwi.local

# Database
DB_DATABASE=db_cmwi
DB_USERNAME=bosani
DB_PASSWORD=1234567890

# JWT
JWT_SECRET=cmwi-secret-key-2026
```

### 4. Generate SSL Certificate (Sekali Saja)

Sertifikat sudah disediakan di `nginx/certs/`. Jika ingin generate ulang:

**Linux/Mac:**
```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout nginx/certs/selfsigned.key \
  -out nginx/certs/selfsigned.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=CMWI/OU=IT/CN=qc.cmwi.local" \
  -addext "subjectAltName=DNS:qc.cmwi.local,IP:192.168.1.100"
```

**Windows (PowerShell):**
```powershell
docker run --rm -v "${PWD}/nginx/certs:/certs" alpine/openssl req -x509 -nodes -days 3650 -newkey rsa:2048 `
  -keyout /certs/selfsigned.key -out /certs/selfsigned.crt `
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=CMWI/OU=IT/CN=qc.cmwi.local" `
  -addext "subjectAltName=DNS:qc.cmwi.local,IP:192.168.1.100"
```

> Ganti `192.168.1.100` dengan IP server yang sebenarnya.

### 5. Build dan Jalankan

Masuk ke folder CMWI:

**Windows:**
```
cd C:\Projects\CMWI
```

**Linux:**
```bash
cd ~/CMWI
```

Jalankan Docker Compose:

```
docker compose up -d --build
```

Proses pertama kali memakan waktu beberapa menit. Tunggu hingga selesai.

### 6. Verifikasi

Cek status semua container:

```
docker compose ps
```

Pastikan 4 service (`db`, `backend`, `frontend`, `nginx`) berstatus **running**.

Tes akses dari server:
```
curl -sk https://localhost:443/health
```

Harus tampil `{"status":"ok"}`.

### 7. Akun Default

Saat pertama kali dijalankan, sistem otomatis membuat 3 akun:

| Username     | Password        | Role        |
|-------------|-----------------|-------------|
| superadmin  | superadmin123   | superadmin  |
| admin       | admin123        | admin       |
| operator    | operator123     | operator    |

## Akses dari PC Karyawan

Setelah deploy berhasil, karyawan bisa akses via:

```
https://qc.cmwi.local
```

> Saat pertama kali buka, browser akan menampilkan peringatan **"Your connection is not private"** karena sertifikat self-signed. Klik **Advanced** > **Proceed to qc.cmwi.local** (Chrome) atau **Accept the Risk** (Firefox). Ini hanya perlu dilakukan sekali.

### Setup Domain di PC Karyawan (Windows)

Setiap PC karyawan perlu ditambahkan 1 baris di file `hosts`:

1. Buka **Notepad** sebagai **Administrator** (klik kanan > Run as administrator)
2. File > Open, buka: `C:\Windows\System32\drivers\etc\hosts`
   (ubah filter dari "Text Documents" ke **"All Files"**)
3. Tambahkan baris ini di paling bawah:
   ```
   192.168.1.100   qc.cmwi.local
   ```
   (ganti `192.168.1.100` dengan IP server yang sebenarnya)
4. Save dan tutup

### Setup Domain di PC Karyawan (Linux/Mac)

```bash
echo "192.168.1.100   qc.cmwi.local" | sudo tee -a /etc/hosts
```

(ganti `192.168.1.100` dengan IP server yang sebenarnya)

### Jika Tidak Bisa Diakses dari PC Lain

1. **Firewall** -- pastikan port HTTPS terbuka:
   - **Windows:** Windows Defender Firewall > Advanced Settings > Inbound Rules > New Rule > Port > TCP `443` (atau port yang digunakan) > Allow > Profile: Private > Name: `CMWI HTTPS`
   - **Linux:** `sudo ufw allow 443/tcp`

2. **Pastikan PC server dan PC karyawan di jaringan/subnet yang sama**

3. **Pastikan Docker berjalan** di server

## Perintah Berguna

### Melihat Log

```
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Restart Semua Service

```
docker compose restart
```

### Stop Semua Service

```
docker compose down
```

### Rebuild Setelah Update Kode

```
docker compose up -d --build
```

### Reset Database (HAPUS SEMUA DATA)

```
docker compose down -v
docker compose up -d --build
```

> **Peringatan:** flag `-v` menghapus semua volume termasuk data PostgreSQL dan file upload.

## Jika IP Server Berubah

Jika IP server berubah (misal karena DHCP):

1. Edit `.env` -- ubah `SERVER_IP` ke IP baru, update juga `APP_URL` jika perlu
2. Generate ulang SSL certificate dengan IP baru (opsional, domain tetap sama)
3. Rebuild:
   ```
   docker compose up -d --build frontend
   ```
4. Update file `hosts` di setiap PC karyawan

**Tips:** Set IP server ke **static IP** di Network Settings agar tidak berubah.

## Struktur Docker

```
CMWI/
├── .env                    ← konfigurasi (IP, domain, DB, JWT)
├── docker-compose.yml      ← orchestration semua service
├── nginx/
│   ├── default.conf        ← reverse proxy + HTTPS config
│   └── certs/
│       ├── selfsigned.crt  ← SSL certificate
│       └── selfsigned.key  ← SSL private key
├── be-test1/
│   ├── Dockerfile          ← build Go backend
│   └── ...
└── fe-test1/
    ├── Dockerfile          ← build Next.js frontend
    └── ...
```

| Service    | Port | Deskripsi                               |
|------------|------|-----------------------------------------|
| `nginx`    | 443  | HTTPS reverse proxy (pintu masuk utama) |
| `nginx`    | 80   | HTTP → redirect ke HTTPS                |
| `db`       | -    | PostgreSQL database (internal only)     |
| `backend`  | -    | Go Gin REST API (internal only)         |
| `frontend` | -    | Next.js web application (internal only) |

Semua traffic masuk melalui Nginx (HTTPS). Backend dan frontend tidak di-expose langsung.

### Data Persistence

Data tersimpan di Docker Volume (tidak hilang saat restart):
- **pgdata** -- data PostgreSQL
- **uploads** -- file foto dan dokumen yang di-upload

Satu-satunya cara data hilang: `docker compose down -v` (flag `-v`).
