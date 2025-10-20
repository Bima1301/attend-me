# 🎉 Response Formatter Implementation Summary

## ✅ Yang Sudah Dibuat

### 1. **Global Response Formatter** (`src/utils/response-formatter.ts`)

File utility global untuk standardisasi response API dengan 3 fungsi utama:

#### a. `formatResponse<T>()` - Untuk Single Data

Digunakan untuk endpoint yang mengembalikan data tunggal (create, update, get by id, delete)

```typescript
formatResponse(data, "Custom message", []);
```

**Output:**

```json
{
  "content": {
    /* data */
  },
  "message": "Custom message",
  "errors": []
}
```

#### b. `formatListResponse<T>()` - Untuk List/Paginated Data

Digunakan untuk endpoint get all dengan pagination

```typescript
formatListResponse(entries, totalData, totalPage, "Custom message", []);
```

**Output:**

```json
{
  "content": {
    "entries": [
      /* array data */
    ],
    "totalData": 100,
    "totalPage": 10
  },
  "message": "Custom message",
  "errors": []
}
```

#### c. `formatErrorResponse()` - Untuk Error Response

Digunakan untuk error handling

```typescript
formatErrorResponse("Error message", ["error detail"]);
```

**Output:**

```json
{
  "content": null,
  "message": "Error message",
  "errors": ["error detail"]
}
```

---

### 2. **Updated Files**

#### `src/controllers/user-controller.ts`

- ✅ Menambahkan import response formatter
- ✅ Update endpoint POST `/api/users` (register) menggunakan `formatResponse`
- ✅ Menambahkan endpoint GET `/api/users/all` (get all with pagination) menggunakan `formatListResponse`
- ✅ Implementasi error handling dengan `formatErrorResponse`

#### `src/services/user-service.ts`

- ✅ Menambahkan method `getAllUsers()` untuk get all users dengan pagination
- ✅ Support query parameters: `page` dan `limit`
- ✅ Return structure: `{ users, totalData, totalPage }`

#### `src/models/user-model.ts`

- ✅ Menambahkan type `RegisterUserRequest`

#### `src/index.ts`

- ✅ Import dan route `userController` ke main app

---

## 🚀 Cara Menggunakan

### Untuk Single Data (Create, Update, Get by ID, Delete):

```typescript
import {
  formatResponse,
  formatErrorResponse,
} from "../utils/response-formatter";

// Success response
return c.json(formatResponse(data, "Custom success message"), 200);

// Error response
return c.json(formatErrorResponse("Error message"), 400);
```

### Untuk List Data (Get All dengan Pagination):

```typescript
import { formatListResponse } from "../utils/response-formatter";

const { users, totalData, totalPage } = await UserService.getAllUsers(
  page,
  limit
);

return c.json(
  formatListResponse(users, totalData, totalPage, "Custom list message"),
  200
);
```

---

## 📋 Contoh Implementasi Lengkap

### Service Layer:

```typescript
static async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [users, totalData] = await Promise.all([
        prismaClient.user.findMany({
            skip,
            take: limit,
            select: { id: true, name: true, email: true }
        }),
        prismaClient.user.count()
    ])

    const totalPage = Math.ceil(totalData / limit)

    return { users, totalData, totalPage }
}
```

### Controller Layer:

```typescript
userController.get("/api/users/all", async (c) => {
  try {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const { users, totalData, totalPage } = await UserService.getAllUsers(
      page,
      limit
    );

    return c.json(
      formatListResponse(
        users,
        totalData,
        totalPage,
        "Successfully fetched all users!"
      ),
      200
    );
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});
```

---

## 🎯 Keuntungan

1. ✅ **Konsistensi** - Semua response API mengikuti format yang sama
2. ✅ **Type-Safe** - Menggunakan TypeScript generics untuk type safety
3. ✅ **Reusable** - Bisa digunakan di semua controller dan module
4. ✅ **Customizable** - Message bisa disesuaikan untuk setiap endpoint
5. ✅ **Scalable** - Mudah untuk extend atau menambah format baru
6. ✅ **Error Handling** - Sudah include error handling yang konsisten

---

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di:

- `/doc/response-format-guide.md` - Panduan lengkap penggunaan response formatter

---

## 🔄 Next Steps (Opsional)

Anda bisa menggunakan pattern ini untuk:

1. **Contacts API** - Implementasi response formatter untuk contact endpoints
2. **Authentication** - Custom formatter untuk login/register dengan token
3. **Other Modules** - Terapkan ke semua module lain yang akan dibuat

### Contoh untuk Contact:

```typescript
// Controller
contactController.get("/api/contacts/all", async (c) => {
  const { contacts, totalData, totalPage } =
    await ContactService.getAllContacts(page, limit);

  return c.json(
    formatListResponse(
      contacts,
      totalData,
      totalPage,
      "Successfully fetched all contacts!"
    ),
    200
  );
});
```

---

## 🧪 Testing

### Test Get All Users:

```bash
GET http://localhost:3000/api/users/all?page=1&limit=10
```

**Expected Response:**

```json
{
  "content": {
    "entries": [{ "id": "1", "name": "John", "email": "john@example.com" }],
    "totalData": 1,
    "totalPage": 1
  },
  "message": "Successfully fetched all users!",
  "errors": []
}
```

### Test Register User:

```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "content": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Successfully registered user",
  "errors": []
}
```

---

## ✨ Summary

Sekarang project Anda memiliki:

- ✅ Global response formatter yang konsisten
- ✅ Support untuk single data dan paginated list
- ✅ Customizable message untuk setiap endpoint
- ✅ Type-safe dengan TypeScript
- ✅ Error handling yang proper
- ✅ Documentation lengkap
- ✅ Example implementation di user endpoints

Semua endpoint baru tinggal import dan gunakan formatter ini! 🎉
