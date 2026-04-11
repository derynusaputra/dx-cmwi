# Panduan Deploy CMWI di Docker Windows

Panduan lengkap untuk menjalankan aplikasi CMWI di **Docker Desktop Windows**, sehingga bisa diakses oleh semua device di **satu jaringan WiFi** via HTTPS.

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Step 1 — Install Docker Desktop](#step-1--install-docker-desktop)
- [Step 2 — Copy Project ke PC Windows](#step-2--copy-project-ke-pc-windows)
- [Step 3 — Cek IP WiFi PC Windows](#step-3--cek-ip-wifi-pc-windows)
- [Step 4 — Edit Konfigurasi (.env)](#step-4--edit-konfigurasi-env)
- [Step 5 — Generate SSL Certificate](#step-5--generate-ssl-certificate)
- [Step 6 — Build dan Jalankan Docker](#step-6--build-dan-jalankan-docker)
- [Step 7 — Verifikasi Semua Berjalan](#step-7--verifikasi-semua-berjalan)
- [Step 8 — Buka Firewall Windows](#step-8--buka-firewall-windows)
- [Step 9 — Akses dari Device Lain](#step-9--akses-dari-device-lain)
- [Akun Default](#akun-default)
- [Perintah Berguna](#perintah-berguna)
- [Troubleshooting](#troubleshooting)
- [Arsitektur Docker](#arsitektur-docker)

---

## Prasyarat

| Kebutuhan | Keterangan |
|-----------|------------|
| **Windows 10/11** | Versi Pro, Enterprise, atau Education (untuk WSL2/Hyper-V) |
| **RAM** | Minimal 8 GB (disarankan 16 GB) |
| **Disk** | Minimal 10 GB ruang kosong |
| **Koneksi WiFi** | PC server dan device lain harus di jaringan WiFi yang sama |

> **Catatan:** Windows Home juga bisa, asalkan menggunakan WSL2 backend (bukan Hyper-V).

---

## Step 1 — Install Docker Desktop

1. Download **Docker Desktop for Windows** dari:
   https://www.docker.com/products/docker-desktop/

2. Jalankan installer. Pastikan opsi **"Use WSL 2 based engine"** dicentang.

3. Setelah instalasi selesai, **restart PC**.

4. Buka **Docker Desktop** — tunggu hingga statusnya **"Docker Desktop is running"** (ikon paus di system tray).

5. Buka **PowerShell**, verifikasi:

   ```powershell
   docker --version
   docker compose version
   ```

   Jika keduanya menampilkan versi, Docker siap.

---

## Step 2 — Copy Project ke PC Windows

Copy seluruh folder project `dx-cmwi/` ke PC Windows. Bisa menggunakan:
- Flash drive / USB
- Network share (SMB)
- Git clone

Contoh lokasi: `C:\Projects\dx-cmwi`

---

## Step 3 — Cek IP WiFi PC Windows

Buka **PowerShell**, jalankan:

```powershell
ipconfig
```

Cari bagian **"Wireless LAN adapter Wi-Fi"** → catat **IPv4 Address**, contoh:

```
Wireless LAN adapter Wi-Fi:

   IPv4 Address. . . . . . . . . . . : 192.168.1.50
```

> Catat IP ini, akan digunakan di beberapa langkah berikutnya. Contoh di panduan ini menggunakan `192.168.1.50` — **ganti dengan IP Anda yang sebenarnya**.

---

## Step 4 — Edit Konfigurasi (.env)

Buka file `.env` di root folder project dengan Notepad atau editor lain.

Jika belum ada file `.env`, copy dari template:

```powershell
copy .env.example .env
```

Edit nilai berikut sesuai IP Anda:

```env
# Ganti dengan IP WiFi PC Windows Anda (dari Step 3)
SERVER_IP=192.168.1.50

# Domain lokal (opsional, bisa akses langsung via IP)
APP_DOMAIN=qc.cmwi.local

# Port HTTPS dan HTTP
NGINX_PORT=8443
NGINX_HTTP_PORT=8880

# URL aplikasi — gunakan IP agar semua device bisa akses tanpa edit hosts
APP_URL=https://192.168.1.50:8443

# PostgreSQL (jangan ubah DB_HOST, biarkan "postgres")
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=db_cmwi
DB_USERNAME=dery
DB_PASSWORD=apaannih

# JWT Secret (ganti dengan string acak Anda sendiri)
JWT_SECRET=cmwi-secret-key-2026
```

> **Tips:** Jika `APP_URL` menggunakan IP langsung (`https://192.168.1.50:8443`), maka device lain **tidak perlu edit file hosts**. Ini cara paling mudah.

---

## Step 5 — Generate SSL Certificate

HTTPS membutuhkan SSL certificate. Ada **2 opsi**:

### Opsi A: Self-Signed Certificate (Cepat, Ada Warning Browser)

Buka **PowerShell** di folder project, jalankan:

```powershell
docker run --rm -v "${PWD}/nginx/certs:/certs" alpine/openssl req -x509 -nodes -days 3650 -newkey rsa:2048 `
  -keyout /certs/selfsigned.key `
  -out /certs/selfsigned.crt `
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=CMWI/OU=IT/CN=qc.cmwi.local" `
  -addext "subjectAltName=DNS:qc.cmwi.local,DNS:localhost,IP:192.168.1.50,IP:127.0.0.1"
```

> **PENTING:** Ganti `192.168.1.50` dengan IP WiFi Anda dari Step 3.

Certificate akan dibuat di `nginx/certs/selfsigned.crt` dan `selfsigned.key`, berlaku 10 tahun.

Kelebihan: Satu perintah, langsung jadi.
Kekurangan: Browser menampilkan warning "Your connection is not private" (klik Advanced → Proceed untuk lanjut).

---

### Opsi B: mkcert (Tanpa Warning Browser, Recommended)

**mkcert** membuat CA (Certificate Authority) lokal di PC Anda, sehingga browser **tidak menampilkan warning**.

#### 1. Install mkcert

**Cara 1 — via Chocolatey** (jika sudah terinstall):
```powershell
choco install mkcert
```

**Cara 2 — Download manual:**
1. Buka https://github.com/FiloSottasso/mkcert/releases
2. Download file `mkcert-vX.X.X-windows-amd64.exe`
3. Rename menjadi `mkcert.exe`
4. Pindahkan ke folder yang ada di PATH, misal `C:\Windows\` atau buat folder baru dan tambahkan ke PATH

#### 2. Install CA lokal (satu kali saja, perlu Admin)

Buka **PowerShell sebagai Administrator**:

```powershell
mkcert -install
```

Akan muncul popup konfirmasi — klik **Yes**. Ini menginstall root CA ke Windows trust store.

#### 3. Generate certificate

Kembali ke **PowerShell biasa** (tidak perlu Admin), masuk ke folder project:

```powershell
cd C:\Projects\dx-cmwi
mkcert -key-file nginx/certs/selfsigned.key -cert-file nginx/certs/selfsigned.crt qc.cmwi.local localhost 127.0.0.1 192.168.1.50
```

> Ganti `192.168.1.50` dengan IP WiFi Anda.

#### 4. (Opsional) Agar device lain juga tidak ada warning

Export root CA:
```powershell
mkcert -CAROOT
```

Buka folder yang ditampilkan, copy file **`rootCA.pem`**. Lalu install di device lain:

- **Windows lain:** Double-click `rootCA.pem` → Install Certificate → Local Machine → Trusted Root Certification Authorities
- **Android:** Settings → Security → Install from storage → pilih `rootCA.pem`
- **iPhone/iPad:** Kirim via email/AirDrop → Install Profile → Settings → General → About → Certificate Trust Settings → aktifkan

---

## Step 6 — Build dan Jalankan Docker

Buka **PowerShell** di folder project:

```powershell
cd C:\Projects\dx-cmwi
docker compose up -d --build
```

Proses pertama kali memakan waktu **5-15 menit** (download images + build Go + build Next.js). Selanjutnya hanya beberapa detik.

Tunggu hingga selesai — akan muncul:

```
✔ Container dx-cmwi-postgres-1  Started
✔ Container dx-cmwi-backend-1   Started
✔ Container dx-cmwi-frontend-1  Started
✔ Container dx-cmwi-nginx-1     Started
```

---

## Step 7 — Verifikasi Semua Berjalan

### Cek status container

```powershell
docker compose ps
```

Harus ada **4 container** dengan status **Up** atau **running**:

```
NAME                   STATUS
dx-cmwi-postgres-1     Up (healthy)
dx-cmwi-backend-1      Up
dx-cmwi-frontend-1     Up
dx-cmwi-nginx-1        Up
```

> **Penting:** Pastikan postgres statusnya `Up (healthy)` — jika masih `starting`, tunggu beberapa detik lalu cek lagi.

### Tes API health check

```powershell
curl -sk https://localhost:8443/health
```

Harus muncul:

```json
{"status":"ok"}
```

### Buka di browser PC server

Buka: **https://localhost:8443**

- Jika pakai self-signed cert → klik **Advanced** → **Proceed to localhost**
- Jika pakai mkcert → langsung terbuka tanpa warning

---

## Step 8 — Buka Firewall Windows

Agar device lain di WiFi bisa mengakses, buka **PowerShell sebagai Administrator**:

```powershell
netsh advfirewall firewall add rule name="CMWI HTTPS" dir=in action=allow protocol=TCP localport=8443
netsh advfirewall firewall add rule name="CMWI HTTP" dir=in action=allow protocol=TCP localport=8880
```

Verifikasi rule berhasil ditambahkan:

```powershell
netsh advfirewall firewall show rule name="CMWI HTTPS"
```

---

## Step 9 — Akses dari Device Lain

### Akses via IP (Paling Mudah)

Dari HP, laptop, atau PC lain yang terhubung ke **WiFi yang sama**, buka browser:

```
https://192.168.1.50:8443
```

> Ganti `192.168.1.50` dengan IP PC server Anda.

Jika menggunakan self-signed cert, di browser:
- **Chrome/Edge:** Klik "Advanced" → "Proceed to 192.168.1.50 (unsafe)"
- **Firefox:** Klik "Advanced" → "Accept the Risk and Continue"
- **Safari (iPhone):** Klik "Show Details" → "visit this website"

### Akses via Domain (Opsional)

Jika ingin akses via `https://qc.cmwi.local:8443`, setiap device perlu ditambahkan mapping di file hosts:

**PC Windows karyawan:**
1. Buka **Notepad** sebagai **Administrator**
2. File → Open → `C:\Windows\System32\drivers\etc\hosts` (ubah filter ke "All Files")
3. Tambahkan di baris paling bawah:
   ```
   192.168.1.50   qc.cmwi.local
   ```
4. Save dan tutup

**Mac/Linux:**
```bash
echo "192.168.1.50   qc.cmwi.local" | sudo tee -a /etc/hosts
```

**Android/iPhone:** Tidak bisa edit hosts tanpa root — gunakan akses via IP saja.

---

## Akun Default

Saat pertama kali dijalankan, sistem otomatis membuat akun-akun berikut:

| Username     | Password        | Role        |
|-------------|-----------------|-------------|
| superadmin  | superadmin123   | superadmin  |
| admin       | admin123        | admin       |
| operator    | operator123     | operator    |

> **Segera ganti password** setelah login pertama kali.

---

## Perintah Berguna

### Melihat log semua service

```powershell
docker compose logs -f
```

### Melihat log service tertentu

```powershell
docker compose logs -f postgres
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Restart semua service

```powershell
docker compose restart
```

### Stop semua service (data tetap aman)

```powershell
docker compose down
```

### Jalankan ulang setelah stop

```powershell
docker compose up -d
```

### Rebuild setelah update kode

```powershell
docker compose up -d --build
```

### Reset database (⚠️ HAPUS SEMUA DATA)

```powershell
docker compose down -v
docker compose up -d --build
```

> **Peringatan:** Flag `-v` menghapus semua volume termasuk data database dan file upload. Gunakan hanya jika ingin mulai dari nol.

---

## Troubleshooting

### Container postgres tidak healthy

```powershell
docker compose logs postgres
```

Biasanya karena port 5432 sudah terpakai. Cek:
```powershell
netstat -ano | findstr :5432
```

Jika ada yang memakai, ubah `DB_PORT` di `.env` ke port lain (misal `5433`).

### Backend terus restart

```powershell
docker compose logs backend
```

Biasanya karena postgres belum ready. Backend akan otomatis retry karena `depends_on` healthcheck. Tunggu 30 detik lalu cek lagi.

### Tidak bisa diakses dari device lain

1. **Cek Firewall** — sudah jalankan Step 8?
2. **Cek jaringan** — pastikan device di WiFi yang **sama**
3. **Cek IP** — pastikan IP di `.env` masih benar (bisa berubah jika DHCP)
4. **Ping test** dari device lain:
   ```
   ping 192.168.1.50
   ```
   Jika tidak reply → masalah jaringan/firewall

### Browser menampilkan ERR_SSL_VERSION_OR_CIPHER_MISMATCH

Certificate mungkin corrupt. Generate ulang (Step 5) lalu restart nginx:
```powershell
docker compose restart nginx
```

### IP server berubah (DHCP)

1. Cek IP baru: `ipconfig`
2. Edit `.env` → update `SERVER_IP` dan `APP_URL`
3. Generate ulang SSL certificate dengan IP baru (Step 5)
4. Rebuild frontend (karena `APP_URL` di-bake saat build):
   ```powershell
   docker compose up -d --build frontend
   docker compose restart nginx
   ```
5. Update file hosts di PC karyawan (jika pakai domain)

> **Tips:** Set IP PC server ke **Static IP** di Windows Network Settings agar tidak berubah-ubah.

### Cara set Static IP di Windows

1. Settings → Network & Internet → Wi-Fi → klik nama WiFi
2. Scroll ke "IP assignment" → klik **Edit**
3. Pilih **Manual** → aktifkan **IPv4**
4. Isi:
   - IP address: `192.168.1.50` (IP yang Anda inginkan)
   - Subnet mask: `255.255.255.0`
   - Gateway: `192.168.1.1` (IP router, biasanya .1)
   - DNS: `8.8.8.8` dan `8.8.4.4`
5. Save

---

## Arsitektur Docker

```
┌─────────────────────────────────────────────────────┐
│                  Docker Compose                      │
│                                                      │
│  ┌────────────┐                                      │
│  │ PostgreSQL  │ ← data tersimpan di volume "pgdata" │
│  │ :5432       │                                      │
│  └──────┬─────┘                                      │
│         │                                            │
│  ┌──────┴─────┐     ┌───────────┐                    │
│  │  Backend   │     │  Nginx    │◄── :8443 (HTTPS)   │
│  │  (Go)      │◄────│           │◄── :8880 (HTTP)    │
│  │  :8080     │     │  :443/80  │                    │
│  └────────────┘     └─────┬─────┘                    │
│                           │                          │
│  ┌────────────┐           │                          │
│  │  Frontend  │◄──────────┘                          │
│  │  (Next.js) │                                      │
│  │  :3000     │                                      │
│  └────────────┘                                      │
└─────────────────────────────────────────────────────┘
```

| Service      | Image/Build        | Port Host  | Deskripsi                               |
|-------------|--------------------|-----------|-----------------------------------------|
| `postgres`  | postgres:16-alpine | 5432      | Database PostgreSQL                      |
| `backend`   | be-cmwi/Dockerfile | —         | Go REST API (internal, via nginx)        |
| `frontend`  | fe-cmwi/Dockerfile | —         | Next.js web app (internal, via nginx)    |
| `nginx`     | nginx:alpine       | 8443, 8880| HTTPS reverse proxy (pintu masuk utama) |

### Data Persistence

Data tersimpan di Docker Volume (tidak hilang saat restart/recreate):

| Volume    | Isi                          |
|-----------|------------------------------|
| `pgdata`  | Data PostgreSQL              |
| `uploads` | File foto/dokumen yang di-upload |

Satu-satunya cara data hilang: `docker compose down -v` (flag `-v`).

### Struktur File

```
dx-cmwi/
├── .env                    ← konfigurasi (IP, domain, DB, JWT)
├── .env.example            ← template .env (tanpa secret)
├── docker-compose.yml      ← orchestration 4 service
├── nginx/
│   ├── default.conf        ← reverse proxy + HTTPS config
│   └── certs/
│       ├── selfsigned.crt  ← SSL certificate
│       └── selfsigned.key  ← SSL private key
├── be-cmwi/
│   ├── Dockerfile          ← build Go backend
│   └── ...
└── fe-cmwi/
    ├── Dockerfile          ← build Next.js frontend
    └── ...
```
