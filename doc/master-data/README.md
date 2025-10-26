# Master Data Module

Modul ini berisi pengelolaan master data untuk sistem attendance. Setiap master data memiliki struktur yang konsisten dengan folder terpisah untuk setiap layer.

## Struktur Folder

```
src/
├── controllers/master-data/
│   └── shift-controller.ts
├── services/master-data/
│   └── shift-service.ts
├── models/master-data/
│   └── shift-model.ts
└── validations/master-data/
    └── shift-validation.ts
```

## Master Data yang Tersedia

### 1. Shift

Master data untuk mengelola shift kerja dengan properties:

- `name`: Nama shift (string)
- `clockIn`: Jam masuk (string, format HH:MM)
- `clockOut`: Jam keluar (string, format HH:MM)
- `isActive`: Status aktif (boolean)

## Database Schema

### Shift Table

```sql
CREATE TABLE shifts (
  id        VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR NOT NULL,
  clock_in  VARCHAR NOT NULL,
  clock_out VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Shift Endpoints

- `POST /api/master-data/shifts` - Create shift
- `GET /api/master-data/shifts` - Get all shifts
- `GET /api/master-data/shifts/active` - Get active shifts
- `GET /api/master-data/shifts/:id` - Get shift by ID
- `PATCH /api/master-data/shifts/:id` - Update shift
- `PATCH /api/master-data/shifts/:id/toggle` - Toggle shift status
- `DELETE /api/master-data/shifts/:id` - Delete shift

## Validasi

### Shift Validation

- Nama shift harus unik untuk shift aktif
- Format waktu harus HH:MM (24 jam)
- Jam keluar harus setelah jam masuk
- Semua field wajib diisi saat create
- Field opsional saat update

## Authentication

Semua endpoint master data memerlukan authentication token.

## Error Handling

- 400: Bad Request (validasi gagal, nama duplikat)
- 401: Unauthorized (token tidak valid)
- 404: Not Found (data tidak ditemukan)
- 500: Internal Server Error

## Testing

Gunakan file `doc/master-data/shift-requests.rest` untuk testing API dengan REST Client.
