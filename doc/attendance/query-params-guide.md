# Attendance API - Centralized Query Parameters Documentation

## Overview

All GET endpoints in the Attendance API support centralized query parameters for filtering, searching, and pagination. This provides a consistent and powerful way to query data across all endpoints.

## Query Parameters

### Basic Pagination

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### Filtering Data (`filters`)

Filter data based on exact column values using JSON format.

**Format:** `filters={"column":"value"}`

**Examples:**

```http
# Filter attendance by status
GET /api/attendance/history?filters={"status":"PRESENT"}

# Filter leaves by type and status
GET /api/leaves?filters={"type":"VACATION","status":"PENDING"}

# Filter meetings by status
GET /api/meetings?filters={"status":"SCHEDULED"}

# Filter notices by type and priority
GET /api/notices?filters={"type":"HOLIDAY","priority":"HIGH"}
```

**Multi-value Filters:**

```http
# Filter by multiple values in same column
GET /api/leaves?filters={"type":["VACATION","SICK"]}
```

### Searching Data (`searchFilters`)

Search data using partial text matching (case-insensitive) using JSON format.

**Format:** `searchFilters={"column":"search_term"}`

**Examples:**

```http
# Search attendance notes
GET /api/attendance/history?searchFilters={"notes":"office"}

# Search leave reasons
GET /api/leaves?searchFilters={"reason":"vacation"}

# Search meeting titles and locations
GET /api/meetings?searchFilters={"title":"standup","location":"conference"}

# Search notice titles and content
GET /api/notices?searchFilters={"title":"holiday","content":"office"}
```

### Range Filtering (`rangedFilters`)

Filter data within a specific range using JSON array format.

**Format:** `rangedFilters=[{"key":"column","start":"value","end":"value"}]`

**Examples:**

```http
# Filter attendance by date range
GET /api/attendance/history?rangedFilters=[{"key":"createdAt","start":"2025-01-01T00:00:00Z","end":"2025-01-31T23:59:59Z"}]

# Filter leaves by start date range
GET /api/leaves?rangedFilters=[{"key":"startDate","start":"2025-01-01T00:00:00Z","end":"2025-01-31T23:59:59Z"}]

# Filter meetings by start time range
GET /api/meetings?rangedFilters=[{"key":"startTime","start":"2025-01-01T00:00:00Z","end":"2025-01-31T23:59:59Z"}]

# Filter notices by creation date range
GET /api/notices?rangedFilters=[{"key":"createdAt","start":"2025-01-01T00:00:00Z","end":"2025-01-31T23:59:59Z"}]
```

## Combined Usage

You can combine all query parameters for powerful data filtering:

```http
# Complex query example
GET /api/attendance/history?page=1&limit=20&filters={"status":"PRESENT","workMode":"OFFICE"}&searchFilters={"notes":"office"}&rangedFilters=[{"key":"createdAt","start":"2025-01-01T00:00:00Z","end":"2025-01-31T23:59:59Z"}]
```

## Available Endpoints

### Attendance

- `GET /api/attendance/history` - Get attendance history with filters

**Available Filters:**

- `status`: PRESENT, LATE, ABSENT
- `workMode`: OFFICE, HOME

**Available Search Filters:**

- `notes`: Search in attendance notes

**Available Range Filters:**

- `createdAt`: Filter by creation date
- `checkIn`: Filter by check-in time
- `checkOut`: Filter by check-out time

### Leaves

- `GET /api/leaves` - Get leaves with filters

**Available Filters:**

- `type`: SICK, VACATION, PERSONAL, EMERGENCY
- `status`: PENDING, APPROVED, REJECTED

**Available Search Filters:**

- `reason`: Search in leave reason

**Available Range Filters:**

- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `createdAt`: Filter by creation date

### Meetings

- `GET /api/meetings` - Get meetings with filters

**Available Filters:**

- `status`: SCHEDULED, ONGOING, COMPLETED, CANCELLED

**Available Search Filters:**

- `title`: Search in meeting title
- `description`: Search in meeting description
- `location`: Search in meeting location

**Available Range Filters:**

- `startTime`: Filter by start time
- `endTime`: Filter by end time
- `createdAt`: Filter by creation date

### Notices

- `GET /api/notices` - Get notices with filters

**Available Filters:**

- `type`: GENERAL, URGENT, HOLIDAY, POLICY
- `priority`: LOW, NORMAL, HIGH, URGENT
- `isActive`: true, false

**Available Search Filters:**

- `title`: Search in notice title
- `content`: Search in notice content

**Available Range Filters:**

- `createdAt`: Filter by creation date
- `updatedAt`: Filter by update date

## Response Format

All filtered endpoints return data in this format:

```json
{
  "success": true,
  "message": "Successfully got data",
  "data": {
    "items": [...],
    "totalData": 100,
    "totalPage": 10
  }
}
```

## Tips

1. **URL Encoding**: When using complex JSON in query parameters, make sure to URL encode them properly
2. **Date Format**: Use ISO 8601 format for dates: `2025-01-01T00:00:00Z`
3. **Case Sensitivity**: Search filters are case-insensitive
4. **Performance**: Use specific filters to improve query performance
5. **Pagination**: Always use pagination for large datasets to avoid timeout

## Error Handling

- Invalid JSON in query parameters will be ignored
- Invalid date formats will return validation errors
- Non-existent columns in filters will be ignored
- Empty filters will return all data (with pagination)
