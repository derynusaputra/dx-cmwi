# CMWI Frontend (fe-test1)

Aplikasi web frontend untuk QC Patrol CMWI, dibangun dengan Next.js, React, dan Tailwind CSS.

## Tech Stack

- **Next.js** 16 (App Router, Turbopack)
- **React** 19
- **Tailwind CSS** 4
- **Zustand** -- state management
- **TanStack React Query** -- data fetching
- **Axios** -- HTTP client

## Fitur

- Login multi-role (superadmin, admin, operator)
- Dashboard admin panel
- Form QC Patrol Painting (submit inspeksi)
  - Ambil foto via webcam (WebRTC)
  - Upload foto dari galeri (multiple)
  - Upload lampiran (PDF, XLSX, DOCX, CSV)
- Tabel admin Painting Inspections (search, filter, pagination)
- Detail inspeksi dengan lightbox foto
- JWT authentication dengan auto-refresh token

## Struktur Project

```
fe-test1/
├── src/
│   ├── app/
│   │   ├── app/                    # Halaman operator
│   │   │   ├── dashboard/          # Dashboard operator
│   │   │   └── qcpatrol/
│   │   │       └── painting/       # Form QC Patrol Painting
│   │   ├── (admin)/                # Halaman admin panel
│   │   │   └── (others-pages)/
│   │   │       └── qc-patrol/
│   │   │           └── painting/   # Tabel Painting Inspections
│   │   ├── signin/                 # Halaman login
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/                 # Reusable components
│   ├── lib/
│   │   └── axios.ts                # Axios instance + interceptors
│   └── stores/
│       └── authStore.ts            # Zustand auth store
├── public/                         # Static assets
├── Dockerfile                      # Multi-stage Docker build
├── next.config.ts                  # Next.js config (standalone output)
├── tailwind.config.ts
├── package.json
└── package-lock.json
```

## Setup Lokal (Development)

### Prasyarat

- Node.js 20+
- npm 10+
- Backend (`be-test1`) harus sudah berjalan di `http://localhost:8080`

### 1. Masuk ke folder

```bash
cd fe-test1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi environment

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

## Setup Docker

### Standalone (tanpa Docker Compose)

```bash
# Build image (ganti API URL sesuai kebutuhan)
docker build -t cmwi-frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://192.168.0.119:8080 \
  .

# Jalankan container
docker run -d \
  --name cmwi-frontend \
  -p 3000:3000 \
  cmwi-frontend
```

> **Penting:** `NEXT_PUBLIC_API_URL` adalah build-time variable. Jika URL backend berubah, image harus di-build ulang.

### Dengan Docker Compose (Rekomendasi)

Gunakan `docker-compose.yml` di root folder `CMWI/`:

```bash
cd CMWI
docker compose up -d --build
```

Lihat [README-DEPLOY.md](../README-DEPLOY.md) untuk panduan lengkap deployment.

## Environment Variables

| Variable               | Tipe       | Deskripsi                         |
|------------------------|------------|-----------------------------------|
| `NEXT_PUBLIC_API_URL`  | Build-time | URL backend API                   |

> `NEXT_PUBLIC_*` di Next.js di-embed saat build, bukan saat runtime. Jika nilainya berubah, harus rebuild image.

## Dockerfile (Multi-stage Build)

Build menggunakan 3 stage untuk image yang optimal (~150MB):

1. **deps** -- install `node_modules` dengan `npm ci`
2. **builder** -- build Next.js (`npm run build`) dengan output `standalone`
3. **runner** -- jalankan `node server.js` di `node:20-alpine` (tanpa devDependencies)

### Standalone Output

Next.js dikonfigurasi dengan `output: "standalone"` di `next.config.ts`, yang menghasilkan folder mandiri berisi hanya file yang diperlukan untuk production. Ini mengurangi ukuran image secara signifikan.

## Scripts

| Perintah       | Deskripsi                    |
|---------------|------------------------------|
| `npm run dev` | Jalankan development server  |
| `npm run build` | Build untuk production     |
| `npm run start` | Jalankan production server |
| `npm run lint`  | Jalankan ESLint            |
