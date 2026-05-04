# 📋 QCR Workflow — QC-PANDAWARA (CMWI)

> Dokumen ini menjelaskan alur lengkap proses Quality Check Request (QCR), mulai dari
> pembuatan request oleh Requester hingga selesai disetujui QC-AMG.

---

## 🗺️ Overview Flow

```
[Requester]
    │
    ▼  POST /qcr
┌─────────────────────────────┐
│  Status: Pending Request    │  ◄── Initial status saat QCR dibuat
│         Manager             │
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/approve   (Role: re_mg, DeptSection harus sama)
┌─────────────────────────────┐
│  Status: Pending QC-GL      │
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/receive   (Role: qc_gl)
┌─────────────────────────────┐
│  Status: Assigned           │  ◄── Inspector sudah di-assign oleh QC-GL
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/start     (Role: qc_inspector / qc_gl)
┌─────────────────────────────┐
│  Status: In Progress        │  ◄── Inspector mulai pengecekan
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/submit-report  (Role: qc_inspector / qc_gl)
┌─────────────────────────────┐
│  Status: Pending QC-GL      │  ◄── Report selesai, nunggu approval QC-GL
│         Approval            │
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/approve   (Role: qc_gl)
┌─────────────────────────────┐
│  Status: Pending QC-SPV     │
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/approve   (Role: qc_spv)
┌─────────────────────────────┐
│  Status: Pending QC-AMG     │
└─────────────────────────────┘
    │
    ▼  PUT /qcr/:id/approve   (Role: qc_amg)
┌─────────────────────────────┐
│  Status: Completed ✅        │
└─────────────────────────────┘
```

---

## 👥 Akun & Role

### Role Requester Side

| Role | Akses | Keterangan |
|------|-------|------------|
| `req` / `requester` | Buat QCR | Requester dari dept tertentu |
| `re_mg` | Approve/Reject step pertama | Request Manager — **wajib DeptSection sama dengan QCR** |

### Role QC Side

| Role | Akses | Keterangan |
|------|-------|------------|
| `qc_gl` | Receive QCR & Assign Inspector, Approve post-report | Group Leader QC |
| `qc_inspector` | Start Check, Submit Report | Inspector yang di-assign |
| `qc_spv` | Approve step ke-3 | QC Supervisor |
| `qc_amg` | Approve step final | QC Asst. Manager |

### Role Admin

| Role | Akses | Keterangan |
|------|-------|------------|
| `admin` / `superadmin` | Semua akses approve tanpa batasan dept | Super user |

---

## 🔐 Status & Siapa yang Bisa Approve

| Status QCR | Role yang Dibutuhkan | Syarat Tambahan |
|---|---|---|
| `Pending Request Manager` | `re_mg` | `dept_section` user **harus sama** dengan QCR |
| `Pending QC-GL` (receive) | `qc_gl` | — |
| `Pending QC-GL Approval` | `qc_gl` | — |
| `Pending QC-SPV` | `qc_spv` | — |
| `Pending QC-AMG` | `qc_amg` | — |

> **Penting:** `admin` dan `superadmin` bisa bypass semua cek role & dept.

---

## 🧑‍💼 Daftar Akun Dev / Test

### Akun Seeded Otomatis (dari seeder.go)

| Username | Password | Role | Dept Section |
|---|---|---|---|
| `superadmin` | `superadmin123` | `superadmin` | — |
| `admin` | `admin123` | `admin` | — |
| `operator` | `operator123` | `operator` | — |
| `requester1` | `req123` | `requester` | PE Casting |
| `remg_casting` | `remg123` | `re_mg` | PE Casting |
| `gl_qcr` | `gl123` | `qc_gl` | — |
| `ara_rm` | `insp123` | `qc_inspector` | — |
| `nurhadi` | `insp123` | `qc_inspector` | — |
| `a_ginanjar` | `insp123` | `qc_inspector` | — |
| `rian_m` | `insp123` | `qc_inspector` | — |
| `hafiz_lu` | `insp123` | `qc_inspector` | — |
| `spv_qcr` | `spv123` | `qc_spv` | — |
| `amg_qcr` | `amg123` | `qc_amg` | — |

### Akun Manual (dibuat via register form)

| Username | Password | Role | Dept Section |
|---|---|---|---|
| `d-operator` | `password` | `operator` | — |
| `der-amg` | `password` | `amg` | — |
| `d-request` | *(lihat doc.md)* | `req` | — |
| `d-request-manager` | *(lihat doc.md)* | `re_mg` | PE Casting ✅ |

---

## 📡 API Endpoints QCR

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `POST` | `/qcr` | Auth | Buat QCR baru (status: Pending Request Manager) |
| `GET` | `/qcr` | Auth | List semua QCR (pagination + filter) |
| `GET` | `/qcr/:id` | Auth | Detail QCR |
| `GET` | `/qcr/my-assignments` | `qc_inspector` | QCR yang di-assign ke inspector ini |
| `GET` | `/qcr/inspectors` | Auth | List user dengan role `qc_inspector` |
| `PUT` | `/qcr/:id/approve` | *(role sesuai status)* | Approve atau Reject QCR |
| `PUT` | `/qcr/:id/receive` | `qc_gl` | QC-GL terima & assign inspector |
| `PUT` | `/qcr/:id/start` | `qc_inspector` / `qc_gl` | Mulai pengecekan |
| `PUT` | `/qcr/:id/submit-report` | `qc_inspector` / `qc_gl` | Submit hasil pengecekan |
| `DELETE` | `/qcr/:id` | Auth | Hapus QCR |

---

## 🚦 Semua Status QCR

| Status | Artinya |
|---|---|
| `Pending Request Manager` | Menunggu approval dari Request Manager dept |
| `Pending QC-GL` | Request Manager sudah approve, menunggu QC-GL receive |
| `Assigned` | QC-GL sudah terima & assign inspector |
| `In Progress` | Inspector sedang mengerjakan pengecekan |
| `Pending QC-GL Approval` | Inspector submit report, menunggu approval QC-GL |
| `Pending QC-SPV` | QC-GL sudah approve, menunggu QC Supervisor |
| `Pending QC-AMG` | QC-SPV sudah approve, menunggu QC Asst. Manager |
| `Completed` | Semua approval selesai ✅ |
| `Rejected by RE_MG` | Ditolak di tahap Request Manager |
| `Rejected by QC_GL` | Ditolak oleh QC Group Leader |
| `Rejected by QC_SPV` | Ditolak oleh QC Supervisor |
| `Rejected by QC_AMG` | Ditolak oleh QC Asst. Manager |

---

## ⚠️ Bug yang Sudah Diperbaiki

### Bug: Request Manager tidak bisa approve

**Sebab:** Akun `re_mg` yang dibuat manual via register tidak punya `dept_section`. Backend
memvalidasi `approver.DeptSection == qcr.DeptSection` — karena `dept_section` kosong vs
"PE Casting", hasilnya 403 Forbidden.

**Fix:** Update `dept_section` user `d-request-manager` di database:
```sql
UPDATE users SET dept_section = 'PE Casting' WHERE username = 'd-request-manager';
```

**Catatan:** Setiap kali membuat akun `re_mg` baru via register, **pastikan DeptSection diisi**
sesuai dept yang akan di-handle. Hal ini bisa dilakukan via:
1. Field `dept_section` ditambahkan di form register (belum ada), atau
2. Update langsung via SQL/admin panel setelah register.

---

## 🖥️ Frontend — Halaman QCR

| URL Path | Komponen | Keterangan |
|---|---|---|
| `/qcr` | `TableQCR.tsx` | Admin — list semua QCR + drawer detail + approve actions |
| `/qcr/create` | `create/page.tsx` | Form buat QCR baru |
| `/app/qcr` | `app/qcr/page.tsx` | Operator/Inspector — list QCR |
| `/app/qcr/:id/report` | `app/qcr/[id]/report/page.tsx` | Inspector submit report |

---

## 📝 Catatan Tambahan

- **DeptSection** pada user `re_mg` adalah mandatory agar bisa approve QCR dari dept-nya.
- **`admin` / `superadmin`** bisa approve QCR dari dept manapun tanpa batasan.
- QCR yang di-reject bisa dilihat statusnya tapi **tidak ada flow re-submit** saat ini.
- Judgment hasil inspector: `OK` atau `NG` (Not Good). Jika `NG`, komentar wajib diisi.
