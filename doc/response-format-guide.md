# Response Format Guide

Panduan penggunaan response formatter global untuk API.

## 📁 Lokasi File

`src/utils/response-formatter.ts`

## 🎯 Format Response

### 1. Single Data Response (untuk create, update, get by id, delete)

**Format:**

```json
{
  "content": {
    /* data object atau null */
  },
  "message": "Custom message",
  "errors": []
}
```

**Fungsi:** `formatResponse<T>(content, message, errors)`

### 2. List/Paginated Response (untuk get all)

**Format:**

```json
{
  "content": {
    "entries": [
      /* array of data */
    ],
    "totalData": 100,
    "totalPage": 10
  },
  "message": "Custom message",
  "errors": []
}
```

**Fungsi:** `formatListResponse<T>(entries, totalData, totalPage, message, errors)`

### 3. Error Response

**Format:**

```json
{
  "content": null,
  "message": "Error message",
  "errors": ["error detail 1", "error detail 2"]
}
```

**Fungsi:** `formatErrorResponse(message, errors)`

## 📚 Cara Penggunaan

### Import Functions

```typescript
import {
  formatResponse,
  formatListResponse,
  formatErrorResponse,
} from "../utils/response-formatter";
```

### Contoh 1: Single Data Response (Create/Update/Get by ID)

```typescript
// Controller
userController.post("/api/users", async (c) => {
  try {
    const req = await c.req.json();
    const user = await UserService.register(req);

    // Default message
    return c.json(formatResponse(user, "Successfully registered user"), 201);

    // atau custom message
    return c.json(formatResponse(user, "User berhasil didaftarkan!"), 201);
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});
```

**Response:**

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

### Contoh 2: List/Paginated Response (Get All)

```typescript
// Controller
userController.get("/api/users/all", async (c) => {
  try {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const { users, totalData, totalPage } = await UserService.getAllUsers(
      page,
      limit
    );

    // Default message
    return c.json(formatListResponse(users, totalData, totalPage), 200);

    // atau custom message
    return c.json(
      formatListResponse(
        users,
        totalData,
        totalPage,
        "Data pengguna berhasil diambil!"
      ),
      200
    );
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});
```

**Response:**

```json
{
  "content": {
    "entries": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "id": "2",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ],
    "totalData": 50,
    "totalPage": 5
  },
  "message": "Successfully fetched all data!",
  "errors": []
}
```

### Contoh 3: Error Response

```typescript
// Controller
userController.get("/api/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = await UserService.getUserById(id);

    if (!user) {
      return c.json(formatErrorResponse("User not found"), 404);
    }

    return c.json(formatResponse(user, "User found"), 200);
  } catch (error) {
    // Error dengan detail
    return c.json(
      formatErrorResponse("Failed to get user", [
        error.message,
        "Please check the user ID",
      ]),
      500
    );
  }
});
```

**Response:**

```json
{
  "content": null,
  "message": "User not found",
  "errors": []
}
```

## 🔧 Service Layer Example

```typescript
// Service
export class UserService {
  static async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, totalData] = await Promise.all([
      prismaClient.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
      prismaClient.user.count(),
    ]);

    const totalPage = Math.ceil(totalData / limit);

    return {
      users, // data array
      totalData, // total keseluruhan data
      totalPage, // total halaman
    };
  }
}
```

## ✅ Best Practices

1. **Gunakan `formatResponse` untuk:**

   - Create (POST)
   - Update (PUT/PATCH)
   - Get by ID (GET)
   - Delete (DELETE)
   - Login/Logout

2. **Gunakan `formatListResponse` untuk:**

   - Get All dengan pagination
   - Search dengan results
   - Filter dengan multiple results

3. **Gunakan `formatErrorResponse` untuk:**

   - Error handling
   - Validation errors
   - Not found errors

4. **Custom Messages:**
   - Selalu berikan message yang jelas dan deskriptif
   - Gunakan bahasa yang konsisten (English atau Indonesian)
   - Message bisa disesuaikan berdasarkan action yang dilakukan

## 📝 Type Safety

Response formatter sudah menggunakan TypeScript generics, sehingga type-safe:

```typescript
// Type akan otomatis di-infer
const response = formatResponse<UserResponse>(user, "Success");

// Atau explicit type
const response: ApiResponse<UserResponse> = formatResponse(user, "Success");

// List response
const listResponse: ApiListResponse<UserResponse> = formatListResponse(
  users,
  totalData,
  totalPage
);
```

## 🎨 Customization

Jika perlu format response yang berbeda, Anda bisa:

1. Menambahkan fungsi baru di `response-formatter.ts`
2. Extend existing interfaces
3. Membuat formatter khusus untuk module tertentu

Contoh:

```typescript
// Custom formatter untuk authentication
export function formatAuthResponse(
  user: UserResponse,
  token: string,
  message: string = "Login successful"
): ApiResponse<UserResponse & { token: string }> {
  return {
    content: { ...user, token },
    message,
    errors: [],
  };
}
```
