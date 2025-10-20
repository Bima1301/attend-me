# 📊 Before & After: Response Format Examples

## 🔴 BEFORE (Manual Response)

### Controller tanpa Response Formatter:

```typescript
userController.post("/api/users", async (c) => {
  try {
    const req = await c.req.json();
    const user = await UserService.register(req);

    // Manual formatting - tidak konsisten
    return c.json(
      {
        content: user,
        message: "Successfully registered user",
        errors: [],
      },
      201
    );
  } catch (error) {
    // Manual error formatting - bisa berbeda di tiap endpoint
    return c.json(
      {
        content: null,
        message: error.message,
        errors: [],
      },
      400
    );
  }
});
```

**Masalah:**

- ❌ Harus manual typing setiap response
- ❌ Bisa inconsistent antar endpoint
- ❌ Tidak type-safe
- ❌ Code repetition
- ❌ Susah maintain kalau mau ubah format

---

## 🟢 AFTER (Dengan Response Formatter)

### 1. Single Data Response (Register, Create, Update, Get by ID)

```typescript
import {
  formatResponse,
  formatErrorResponse,
} from "../utils/response-formatter";

userController.post("/api/users", async (c) => {
  try {
    const req = await c.req.json();
    const user = await UserService.register(req);

    // Clean, consistent, reusable
    return c.json(formatResponse(user, "Successfully registered user"), 201);
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

---

### 2. List/Paginated Response (Get All)

#### Before:

```typescript
userController.get("/api/users/all", async (c) => {
  const users = await UserService.getAllUsers();

  // Manual formatting untuk list
  return c.json({
    data: users, // ❌ structure berbeda dari endpoint lain
    total: users.length,
    message: "Success",
  });
});
```

#### After:

```typescript
import { formatListResponse } from "../utils/response-formatter";

userController.get("/api/users/all", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;

  const { users, totalData, totalPage } = await UserService.getAllUsers(
    page,
    limit
  );

  // Standard format untuk semua list endpoints
  return c.json(
    formatListResponse(
      users,
      totalData,
      totalPage,
      "Successfully fetched all users!"
    ),
    200
  );
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
  "message": "Successfully fetched all users!",
  "errors": []
}
```

---

## 🎨 Customizable Message

### Bahasa Indonesia:

```typescript
return c.json(formatResponse(user, "Pengguna berhasil didaftarkan!"), 201);
```

### Bahasa Inggris:

```typescript
return c.json(formatResponse(user, "User successfully registered!"), 201);
```

### Message Detail:

```typescript
return c.json(
  formatResponse(user, "User John Doe has been registered successfully"),
  201
);
```

### Default Message (jika tidak diisi):

```typescript
return c.json(formatResponse(user), 201);
// Output: message = "Success"
```

---

## 📋 Complete Example: Contact Module

Contoh implementasi lengkap untuk module Contact:

### Service:

```typescript
export class ContactService {
  static async getAllContacts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [contacts, totalData] = await Promise.all([
      prismaClient.contact.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
      }),
      prismaClient.contact.count({
        where: { user_id: userId },
      }),
    ]);

    const totalPage = Math.ceil(totalData / limit);

    return { contacts, totalData, totalPage };
  }

  static async createContact(data: ContactRequest) {
    const contact = await prismaClient.contact.create({ data });
    return contact;
  }
}
```

### Controller:

```typescript
import {
  formatResponse,
  formatListResponse,
  formatErrorResponse,
} from "../utils/response-formatter";

export const contactController = new Hono();

// Get All Contacts (List Response)
contactController.get("/api/contacts", async (c) => {
  try {
    const userId = c.get("userId"); // dari auth middleware
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const { contacts, totalData, totalPage } =
      await ContactService.getAllContacts(userId, page, limit);

    return c.json(
      formatListResponse(
        contacts,
        totalData,
        totalPage,
        "Successfully fetched all contacts!"
      ),
      200
    );
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});

// Create Contact (Single Response)
contactController.post("/api/contacts", async (c) => {
  try {
    const req = await c.req.json();
    const contact = await ContactService.createContact(req);

    return c.json(
      formatResponse(contact, "Contact created successfully!"),
      201
    );
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});

// Get Contact by ID (Single Response)
contactController.get("/api/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const contact = await ContactService.getContactById(id);

    if (!contact) {
      return c.json(formatErrorResponse("Contact not found"), 404);
    }

    return c.json(formatResponse(contact, "Contact found!"), 200);
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});

// Update Contact (Single Response)
contactController.patch("/api/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const req = await c.req.json();
    const contact = await ContactService.updateContact(id, req);

    return c.json(
      formatResponse(contact, "Contact updated successfully!"),
      200
    );
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});

// Delete Contact (Single Response with null content)
contactController.delete("/api/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await ContactService.deleteContact(id);

    return c.json(formatResponse(null, "Contact deleted successfully!"), 200);
  } catch (error) {
    return c.json(formatErrorResponse(error.message), 400);
  }
});
```

---

## ✅ Benefits Summary

| Aspect              | Before                   | After                        |
| ------------------- | ------------------------ | ---------------------------- |
| **Consistency**     | ❌ Manual, berbeda-beda  | ✅ Standar di semua endpoint |
| **Type Safety**     | ❌ Tidak ada             | ✅ Full TypeScript support   |
| **Reusability**     | ❌ Copy-paste code       | ✅ Import & use              |
| **Maintainability** | ❌ Ubah di banyak tempat | ✅ Ubah di 1 file            |
| **Customization**   | ❌ Terbatas              | ✅ Flexible message          |
| **Error Handling**  | ❌ Inconsistent          | ✅ Standard format           |
| **Documentation**   | ❌ Tidak jelas           | ✅ Self-documented           |

---

## 🚀 Quick Start

1. Import formatter di controller:

```typescript
import {
  formatResponse,
  formatListResponse,
  formatErrorResponse,
} from "../utils/response-formatter";
```

2. Untuk single data, gunakan `formatResponse`:

```typescript
return c.json(formatResponse(data, "Custom message"), statusCode);
```

3. Untuk list data, gunakan `formatListResponse`:

```typescript
return c.json(
  formatListResponse(array, totalData, totalPage, "Custom message"),
  statusCode
);
```

4. Untuk error, gunakan `formatErrorResponse`:

```typescript
return c.json(formatErrorResponse("Error message"), statusCode);
```

Done! 🎉
