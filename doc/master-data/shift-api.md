# Master Data - Shift API Documentation

## Overview

API untuk mengelola master data shift dengan operasi CRUD lengkap.

## Endpoints

### 1. Create Shift

**POST** `/api/master-data/shifts`

Membuat shift baru.

**Request Body:**

```json
{
  "name": "Morning Shift",
  "clockIn": "08:00",
  "clockOut": "17:00",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully created shift",
  "data": {
    "id": "uuid",
    "name": "Morning Shift",
    "clockIn": "08:00",
    "clockOut": "17:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Shifts

**GET** `/api/master-data/shifts`

Mengambil semua shift (aktif dan tidak aktif).

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved shifts",
  "data": [
    {
      "id": "uuid",
      "name": "Morning Shift",
      "clockIn": "08:00",
      "clockOut": "17:00",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get Active Shifts

**GET** `/api/master-data/shifts/active`

Mengambil hanya shift yang aktif.

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved active shifts",
  "data": [
    {
      "id": "uuid",
      "name": "Morning Shift",
      "clockIn": "08:00",
      "clockOut": "17:00",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. Get Shift by ID

**GET** `/api/master-data/shifts/:id`

Mengambil shift berdasarkan ID.

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved shift",
  "data": {
    "id": "uuid",
    "name": "Morning Shift",
    "clockIn": "08:00",
    "clockOut": "17:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Shift

**PATCH** `/api/master-data/shifts/:id`

Mengupdate shift berdasarkan ID.

**Request Body:**

```json
{
  "name": "Updated Morning Shift",
  "clockIn": "09:00",
  "clockOut": "18:00",
  "isActive": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully updated shift",
  "data": {
    "id": "uuid",
    "name": "Updated Morning Shift",
    "clockIn": "09:00",
    "clockOut": "18:00",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Toggle Shift Status

**PATCH** `/api/master-data/shifts/:id/toggle`

Mengubah status aktif shift (toggle).

**Response:**

```json
{
  "success": true,
  "message": "Successfully toggled shift status",
  "data": {
    "id": "uuid",
    "name": "Morning Shift",
    "clockIn": "08:00",
    "clockOut": "17:00",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Delete Shift

**DELETE** `/api/master-data/shifts/:id`

Menghapus shift berdasarkan ID.

**Response:**

```json
{
  "success": true,
  "message": "Successfully deleted shift",
  "data": null
}
```

## Validation Rules

### Create Shift

- `name`: Required, string, min 1 character, max 100 characters
- `clockIn`: Required, string, format HH:MM (e.g., "08:00")
- `clockOut`: Required, string, format HH:MM (e.g., "17:00")
- `isActive`: Optional, boolean, default true
- Clock out time must be after clock in time

### Update Shift

- `name`: Optional, string, min 1 character, max 100 characters
- `clockIn`: Optional, string, format HH:MM
- `clockOut`: Optional, string, format HH:MM
- `isActive`: Optional, boolean
- If both clockIn and clockOut are provided, clockOut must be after clockIn

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Shift name already exists"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Shift not found"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Authentication

Semua endpoint memerlukan authentication token di header:

```
Authorization: Bearer <token>
```
