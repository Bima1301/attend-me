# Bulk Delete Guide

## Overview

Bulk delete utility untuk menghapus multiple records sekaligus. Digunakan untuk handle `DELETE` request dengan multiple IDs.

## Features

- ✅ **Multiple deletion** - Hapus banyak record dalam satu request
- ✅ **Error handling** - Handle ID yang tidak ditemukan atau gagal dihapus
- ✅ **Detailed response** - Return informasi tentang berapa banyak yang berhasil dan gagal
- ✅ **Generic utility** - Bisa digunakan di semua service

## Usage Examples

### Controller Implementation

```typescript
// controllers/resource-controller.ts
import { formatResponse } from "../../utils/response-formatter";

// Single delete (existing)
controller.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await ResourceService.delete(id);
  return c.json(formatResponse(null, "Successfully deleted"), 200);
});

// Bulk delete (new)
controller.delete("/", async (c) => {
  const query = Object.fromEntries(
    new URLSearchParams(c.req.url.split("?")[1] || "")
  ) as any;
  const idsParam = query.ids;

  if (!idsParam) {
    return c.json(
      formatResponse(null, "IDs parameter is required", [
        "IDs parameter is required",
      ]),
      400
    );
  }

  let ids: string[];
  try {
    ids = JSON.parse(idsParam);
  } catch {
    return c.json(
      formatResponse(null, "Invalid IDs format", [
        "IDs must be a valid JSON array",
      ]),
      400
    );
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json(
      formatResponse(null, "IDs must be a non-empty array", [
        "IDs must be a non-empty array",
      ]),
      400
    );
  }

  const result = await ResourceService.deleteMany(ids);
  return c.json(formatResponse(result, "Successfully deleted resources"), 200);
});
```

### Service Implementation

```typescript
// services/resource-service.ts
import { bulkDelete } from "../../utils/bulk-delete";
import { prismaClient } from "../../application/database";

export class ResourceService {
  // Single delete
  static async delete(id: string): Promise<void> {
    const existing = await prismaClient.resource.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HTTPException(404, { message: "Resource not found" });
    }

    await prismaClient.resource.delete({
      where: { id },
    });
  }

  // Bulk delete - using utility
  static async deleteMany(ids: string[]): Promise<{
    deletedCount: number;
    failedIds: string[];
    notFoundIds: string[];
  }> {
    return await bulkDelete(prismaClient.resource, ids);
  }
}
```

## API Usage

### Single Delete

```bash
DELETE /api/resources/{id}
```

**Response:**

```json
{
  "content": null,
  "message": "Successfully deleted resource",
  "errors": []
}
```

### Bulk Delete

```bash
DELETE /api/resources?ids=["id1","id2","id3"]
```

**Response:**

```json
{
  "content": {
    "deletedCount": 2,
    "failedIds": ["id3"],
    "notFoundIds": []
  },
  "message": "Successfully deleted resources",
  "errors": []
}
```

## URL Encoding

Ketika menggunakan URL dengan JSON array, pastikan untuk encode dengan benar:

### URL Encoded Example

```
Original: ids=["id1","id2","id3"]
Encoded:  ids=%5B%22id1%22%2C%22id2%22%2C%22id3%22%5D
```

**Full URL:**

```
http://localhost:8080/api/resources?ids=%5B%22id1%22%2C%22id2%22%2C%22id3%22%5D
```

### Using in Code

```javascript
// JavaScript/TypeScript
const ids = ["id1", "id2", "id3"];
const encodedIds = encodeURIComponent(JSON.stringify(ids));
const url = `http://localhost:8080/api/resources?ids=${encodedIds}`;
// Result: http://localhost:8080/api/resources?ids=%5B%22id1%22%2C%22id2%22%2C%22id3%22%5D
```

### Using Postman/cURL

```bash
curl -X DELETE \
  'http://localhost:8080/api/resources?ids=%5B%22id1%22%2C%22id2%22%5D' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Response Fields

### BulkDeleteResult

| Field          | Type       | Description                                                          |
| -------------- | ---------- | -------------------------------------------------------------------- |
| `deletedCount` | `number`   | Jumlah record yang berhasil dihapus                                  |
| `failedIds`    | `string[]` | Array ID yang gagal dihapus (misalnya karena foreign key constraint) |
| `notFoundIds`  | `string[]` | Array ID yang tidak ditemukan di database                            |

## Error Scenarios

### Missing IDs Parameter

**Request:**

```
DELETE /api/resources
```

**Response:**

```json
{
  "content": null,
  "message": "IDs parameter is required for bulk delete",
  "errors": ["IDs parameter is required"]
}
```

### Invalid JSON Format

**Request:**

```
DELETE /api/resources?ids=invalid
```

**Response:**

```json
{
  "content": null,
  "message": "Invalid IDs format",
  "errors": ["IDs must be a valid JSON array"]
}
```

### Empty Array

**Request:**

```
DELETE /api/resources?ids=[]
```

**Response:**

```json
{
  "content": null,
  "message": "IDs must be a non-empty array",
  "errors": ["IDs must be a non-empty array"]
}
```

### Partial Success

**Request:**

```
DELETE /api/resources?ids=["existing1","notfound","existing2"]
```

**Response:**

```json
{
  "content": {
    "deletedCount": 2,
    "failedIds": [],
    "notFoundIds": ["notfound"]
  },
  "message": "Successfully deleted resources",
  "errors": []
}
```

## Implementation Steps

### 1. Add Bulk Delete Utility (Already Done)

File: `src/utils/bulk-delete.ts` - Already created

### 2. Update Service

```typescript
import { bulkDelete } from "../../utils/bulk-delete"

static async deleteMany(ids: string[]): Promise<{ deletedCount: number, failedIds: string[], notFoundIds: string[] }> {
    return await bulkDelete(prismaClient.yourModel, ids)
}
```

### 3. Add Controller Route

```typescript
controller.delete("/", async (c) => {
  const query = Object.fromEntries(
    new URLSearchParams(c.req.url.split("?")[1] || "")
  ) as any;
  const idsParam = query.ids;

  if (!idsParam) {
    return c.json(
      formatResponse(null, "IDs parameter is required", [
        "IDs parameter is required",
      ]),
      400
    );
  }

  let ids: string[];
  try {
    ids = JSON.parse(idsParam);
  } catch {
    return c.json(
      formatResponse(null, "Invalid IDs format", [
        "IDs must be a valid JSON array",
      ]),
      400
    );
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json(
      formatResponse(null, "IDs must be a non-empty array", [
        "IDs must be a non-empty array",
      ]),
      400
    );
  }

  const result = await YourService.deleteMany(ids);
  return c.json(formatResponse(result, "Successfully deleted resources"), 200);
});
```

**Important:** Place the bulk delete route **before** the single delete route `/:id` to avoid route conflicts.

## Best Practices

1. **Always check for IDs parameter** - Return 400 if missing
2. **Validate JSON format** - Catch parsing errors
3. **Check array validity** - Ensure it's an array with items
4. **Place route order correctly** - Bulk delete route should come before `/:id` route
5. **Provide detailed response** - Include deletedCount, failedIds, and notFoundIds

## Order of Routes

```typescript
// Correct order
controller.delete("/", bulkDeleteHandler); // Handle bulk delete
controller.delete("/:id", singleDeleteHandler); // Handle single delete

// Wrong order (will cause issues)
controller.delete("/:id", singleDeleteHandler); // This will catch '/'
controller.delete("/", bulkDeleteHandler); // This will never be reached
```

## Real-World Example

### Shift Service (Already Implemented)

See:

- `src/services/master-data/shift-service.ts` - Service implementation
- `src/controllers/master-data/shift-controller.ts` - Controller implementation

### Test URL

```
http://localhost:8080/api/master-data/shifts?ids=%5B%22f71a3449-5279-4714-96a2-2efa10b00f3e%22%5D
```

**Decoded:**

```
http://localhost:8080/api/master-data/shifts?ids=["f71a3449-5279-4714-96a2-2efa10b00f3e"]
```

## Summary

- ✅ Generic utility `bulkDelete()` available in `src/utils/bulk-delete.ts`
- ✅ Works with any Prisma model
- ✅ Detailed response with success/failure counts
- ✅ Error handling for missing, invalid, or not found IDs
- ✅ Can be used across all services
