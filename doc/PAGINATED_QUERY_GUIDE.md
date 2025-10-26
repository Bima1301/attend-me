# Paginated Query Utility Guide

## Overview

The `PaginatedQuery` utility is a reusable helper that handles pagination, filtering, and searching for all GET all endpoints. Instead of copying and pasting the same code in every service, you can use this utility once.

## Benefits

- ✅ **No code duplication** - Write once, use everywhere
- ✅ **Consistent behavior** - All endpoints work the same way
- ✅ **Easy to maintain** - Fix bugs or add features in one place
- ✅ **Type safe** - Full TypeScript support

## Usage Examples

### Basic Usage (Shift Service)

```typescript
import { PaginatedQuery } from "../../utils/paginated-query"

static async getAll(query: ShiftQueryParams): Promise<{ shifts: ShiftResponse[], totalData: number, totalPage: number }> {
    const result = await PaginatedQuery.execute({
        query,
        model: prismaClient.shift,
        validationSchema: Validation.SHIFT_QUERY,
        defaultOrderBy: { createdAt: 'desc' }
    })

    return {
        shifts: result.data,
        totalData: result.totalData,
        totalPage: result.totalPage
    }
}
```

### With Additional Where Clause (Attendance Service)

```typescript
static async getAttendanceHistory(user: User, query: AttendanceQueryParams): Promise<{ attendances: AttendanceResponse[], totalData: number, totalPage: number }> {
    const result = await PaginatedQuery.execute({
        query,
        model: prismaClient.attendance,
        validationSchema: Validation.ATTENDANCE_QUERY,
        defaultOrderBy: { createdAt: 'desc' },
        where: { userId: user.id }, // Additional filter
        transform: (attendance) => ({
            id: attendance.id,
            // ... transform to response format
        })
    })

    return {
        attendances: result.data,
        totalData: result.totalData,
        totalPage: result.totalPage
    }
}
```

### With Custom Transform Function

```typescript
const result = await PaginatedQuery.execute({
  query,
  model: prismaClient.user,
  validationSchema: Validation.USER_QUERY,
  transform: (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    // Only return safe fields
  }),
});
```

### Multi-Column Search (OR Mode)

Search across multiple columns using OR logic:

```typescript
static async getAll(query: ShiftQueryParams): Promise<{ shifts: ShiftResponse[], totalData: number, totalPage: number }> {
    const result = await PaginatedQuery.execute({
        query,
        model: prismaClient.shift,
        validationSchema: Validation.SHIFT_QUERY,
        defaultOrderBy: { createdAt: 'desc' },
        searchMode: 'OR' // Search across name, clockIn, clockOut with OR logic
    })

    return {
        shifts: result.data,
        totalData: result.totalData,
        totalPage: result.totalPage
    }
}
```

**URL Example:**
```
GET /api/master-data/shifts?searchFilters={"name":"Shift","clockIn":"Shift","clockOut":"Shift"}&page=1&rows=10
```

This will find records where **any** of the fields (name, clockIn, or clockOut) contains "Shift".

To use AND mode (all fields must match):
```typescript
searchMode: 'AND' // All fields must match the search term
```

## Parameters

| Parameter          | Type              | Required | Description                                         |
| ------------------ | ----------------- | -------- | --------------------------------------------------- |
| `query`            | `BaseQueryParams` | ✅       | Query parameters from the request                   |
| `model`            | Prisma Model      | ✅       | Prisma model client (e.g., `prismaClient.shift`)    |
| `validationSchema` | Zod Schema        | ❌       | Schema to validate query params                     |
| `where`            | Object            | ❌       | Additional where conditions                         |
| `orderBy`          | Object            | ❌       | Custom orderBy (overrides defaultOrderBy)           |
| `defaultOrderBy`   | Object            | ❌       | Default order (defaults to `{ createdAt: 'desc' }`) |
| `transform`        | Function          | ❌       | Transform function for each item                    |
| `searchMode`       | 'AND' \| 'OR'     | ❌       | Search mode for multi-column search (default: 'OR') |

## What It Handles Automatically

1. **Pagination** - Parses `page`, `rows` (or `limit`) parameters
2. **Filtering** - Parses `filters` JSON parameter
3. **Searching** - Parses `searchFilters` JSON parameter (case-insensitive)
4. **Range Filtering** - Parses `rangedFilters` JSON parameter
5. **Counting** - Gets total data count
6. **Page Calculation** - Calculates total pages

## Supported Query Parameters

```typescript
GET /api/resource?page=1&rows=10&searchFilters={"name":"test"}&filters={"isActive":true}
```

- `page` - Page number (default: 1)
- `rows` or `limit` - Items per page (default: 10)
- `searchFilters` - JSON string with search criteria (LIKE query)
- `filters` - JSON string with exact match criteria
- `rangedFilters` - JSON string with range criteria

## Example Query URLs

### Simple Pagination

```
GET /api/shifts?page=1&rows=10
```

### With Search

```
GET /api/shifts?searchFilters={"name":"Morning"}&page=1&rows=10
```

### With Filter

```
GET /api/shifts?filters={"isActive":true}&page=1&rows=10
```

### Complete Example

```
GET /api/shifts?searchFilters={"name":"test"}&filters={"isActive":true}&page=2&rows=20
```

## Step-by-Step Implementation

### 1. Create Validation Schema

```typescript
// validations/resource-validation.ts
import { BaseQueryParams, QueryParams } from "../../utils/query-params";

export type ResourceQueryParams = BaseQueryParams;

export const Validation = {
  RESOURCE_QUERY: QueryParams.BASE,
};
```

### 2. Update Service

```typescript
// services/resource-service.ts
import { PaginatedQuery } from "../../utils/paginated-query"

static async getAll(query: ResourceQueryParams): Promise<{ resources: ResourceResponse[], totalData: number, totalPage: number }> {
    const result = await PaginatedQuery.execute({
        query,
        model: prismaClient.resource,
        validationSchema: Validation.RESOURCE_QUERY,
        defaultOrderBy: { createdAt: 'desc' }
    })

    return {
        resources: result.data,
        totalData: result.totalData,
        totalPage: result.totalPage
    }
}
```

### 3. Update Controller

```typescript
// controllers/resource-controller.ts
controller.get("/", async (c) => {
  const query = Object.fromEntries(
    new URLSearchParams(c.req.url.split("?")[1] || "")
  ) as ResourceQueryParams;
  const result = await ResourceService.getAll(query);
  return c.json(
    formatListResponse(
      result.resources,
      result.totalData,
      result.totalPage,
      "Successfully retrieved resources"
    ),
    200
  );
});
```

## Response Format

All endpoints return the same format:

```json
{
  "content": {
    "entries": [...],
    "totalData": 100,
    "totalPage": 5
  },
  "message": "Successfully retrieved resources",
  "errors": []
}
```

## Best Practices

1. Always use `rows` parameter name in your API (not `limit`) for consistency
2. Always provide `validationSchema` for type safety
3. Use `transform` function to map database models to response DTOs
4. Use `where` parameter for security filters (e.g., user-specific data)
5. Provide meaningful `defaultOrderBy` for default sorting

## Migration from Old Code

### Before (Manual Implementation)

```typescript
const validatedQuery = Validation.QUERY.parse(query);
const filters = QueryParams.parseFilters(validatedQuery.filters);
const searchFilters = QueryParams.parseSearchFilters(
  validatedQuery.searchFilters
);
const rangedFilters = QueryParams.parseRangedFilters(
  validatedQuery.rangedFilters
);
const where = QueryParams.buildWhereClause(
  filters,
  searchFilters,
  rangedFilters
);
const { skip, take } = QueryParams.buildPagination(validatedQuery.page, limit);

const [data, totalData] = await Promise.all([
  prismaClient.model.findMany({ where, skip, take, orderBy }),
  prismaClient.model.count({ where }),
]);

const totalPage = Math.ceil(totalData / take);
```

### After (Using Utility)

```typescript
const result = await PaginatedQuery.execute({
  query,
  model: prismaClient.model,
  validationSchema: Validation.QUERY,
});

// result.data, result.totalData, result.totalPage
```

## Need Help?

Check the existing implementations:

- `src/services/master-data/shift-service.ts` - Basic usage
- `src/services/attendance-service.ts` - With custom where and transform
