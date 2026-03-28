# CMWI Backend (be-test1)

REST API backend untuk aplikasi QC Patrol CMWI, dibangun dengan Go, Gin, dan PostgreSQL.

## Tech Stack

- **Go** 1.25+
- **Gin** -- HTTP web framework
- **GORM** -- ORM untuk PostgreSQL
- **JWT** -- autentikasi (access token + refresh token)
- **bcrypt** -- hashing password

## Struktur Project

```
be-test1/
├── main.go                 # Entry point, setup server & CORS
├── config/
│   ├── database.go         # Koneksi database PostgreSQL
│   └── seeder.go           # Seed default users (superadmin, admin, operator)
├── handlers/
│   ├── auth.go             # Login, register, refresh token, logout
│   ├── painting.go         # CRUD Painting Inspection
│   └── upload.go           # Upload file (foto, dokumen)
├── middleware/
│   └── auth.go             # JWT authentication middleware
├── models/
│   ├── user.go             # Model User
│   ├── painting.go         # Model PaintingInspection
│   └── types.go            # Custom types (StringArray, JSONMap)
├── routes/
│   └── routes.go           # Registrasi semua route
├── uploads/                # Penyimpanan file yang di-upload
├── Dockerfile              # Multi-stage Docker build
├── .env                    # Environment variables (lokal)
├── go.mod
└── go.sum
```

## API Endpoints

| Method | Endpoint                         | Auth | Deskripsi                    |
|--------|----------------------------------|------|------------------------------|
| POST   | `/auth/login`                    | -    | Login user                   |
| POST   | `/auth/register`                 | -    | Register user baru           |
| POST   | `/auth/refresh`                  | -    | Refresh access token         |
| POST   | `/auth/logout`                   | -    | Logout (hapus refresh token) |
| GET    | `/user/profile`                  | Ya   | Ambil profil user            |
| POST   | `/uploads`                       | Ya   | Upload file                  |
| POST   | `/painting-inspections`          | Ya   | Buat inspeksi baru           |
| GET    | `/painting-inspections`          | Ya   | List inspeksi (pagination)   |
| GET    | `/painting-inspections/:id`      | Ya   | Detail inspeksi              |
| PUT    | `/painting-inspections/:id/status` | Ya | Update status inspeksi       |
| DELETE | `/painting-inspections/:id`      | Ya   | Hapus inspeksi               |
| GET    | `/health`                        | -    | Health check                 |

## Setup Lokal (Development)

### Prasyarat

- Go 1.25+
- PostgreSQL 16+

### 1. Clone & masuk ke folder

```bash
cd be-test1
```

### 2. Buat database PostgreSQL

```sql
CREATE DATABASE db_cmwi;
```

### 3. Konfigurasi environment

Buat file `.env` di root `be-test1/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=db_cmwi
DB_USERNAME=bosani
DB_PASSWORD=1234567890

JWT_SECRET=cmwi-secret-key-2026
APP_PORT=8080
```

### 4. Jalankan

```bash
go run .
```

Server berjalan di `http://localhost:8080`.

Saat pertama kali dijalankan, GORM akan otomatis membuat tabel (`AutoMigrate`) dan seeder akan membuat 3 akun default:

| Username     | Password        | Role        |
|-------------|-----------------|-------------|
| superadmin  | superadmin123   | superadmin  |
| admin       | admin123        | admin       |
| operator    | operator123     | operator    |

## Setup Docker

### Standalone (tanpa Docker Compose)

```bash
# Build image
docker build -t cmwi-backend .

# Jalankan container
docker run -d \
  --name cmwi-backend \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_DATABASE=db_cmwi \
  -e DB_USERNAME=bosani \
  -e DB_PASSWORD=1234567890 \
  -e JWT_SECRET=cmwi-secret-key-2026 \
  -e APP_PORT=8080 \
  -v cmwi-uploads:/app/uploads \
  cmwi-backend
```

> `host.docker.internal` digunakan agar container bisa akses PostgreSQL yang berjalan di host machine.

### Dengan Docker Compose (Rekomendasi)

Gunakan `docker-compose.yml` di root folder `CMWI/`:

```bash
cd CMWI
docker compose up -d --build
```

Lihat [README-DEPLOY.md](../README-DEPLOY.md) untuk panduan lengkap deployment.

## Environment Variables

| Variable       | Deskripsi                                | Default |
|---------------|------------------------------------------|---------|
| `DB_HOST`     | Hostname PostgreSQL                      | -       |
| `DB_PORT`     | Port PostgreSQL                          | -       |
| `DB_DATABASE` | Nama database                            | -       |
| `DB_USERNAME` | Username database                        | -       |
| `DB_PASSWORD` | Password database                        | -       |
| `JWT_SECRET`  | Secret key untuk JWT                     | -       |
| `APP_PORT`    | Port server                              | `8080`  |
| `CORS_ORIGINS`| Allowed origins, dipisah koma            | `*`     |

## Dockerfile (Multi-stage Build)

Build menggunakan 2 stage untuk menghasilkan image yang kecil (~30MB):

1. **Builder** -- compile Go binary dengan `golang:1.24-alpine`
2. **Runner** -- jalankan binary di `alpine:3.20` (tanpa Go runtime)
