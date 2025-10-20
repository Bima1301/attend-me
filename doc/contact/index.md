# Contact API Spec

## Create Contact

Endpoint: `POST /api/contacts`

### Request

```json
{
  "firstName": "John Doe",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890"
}
```

### Response Body (success)

```json
{
  "content": {
    "id": "1",
    "firstName": "John Doe",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890"
  }
}
```
