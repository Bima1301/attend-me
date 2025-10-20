# USER API

## Register User

Endpoint: `POST /api/users`

### Request

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password"
}
```

### Response Body (success)

```json
{
  "content": {
    "id": "1",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "message": "Successfully registered user",
  "errors": []
}
```

### Response Body (error)

```json
{
  "content": null,
  "message": "User already exists",
  "errors": []
}
```

## Login User

Endpoint: `POST /api/users/login`

### Request

```json
{
  "email": "john.doe@example.com",
  "password": "password"
}
```

### Response Body (success)

```json
{
  "content": {
    "id": "1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "token": "1234567890"
  },
  "message": "Successfully logged in",
  "errors": []
}
```

### Response Body (error)

```json
{
  "content": null,
  "message": "Invalid email or password",
  "errors": []
}
```

## Get User

Endpoint: `GET /api/users`

Request Header:

```
Authorization: Bearer <token>
```

### Response Body (success)

```json
{
  "content": {
    "id": "1",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "message": "Successfully got user",
  "errors": []
}
```

## Update User

Endpoint: `PATCH /api/users`

Request Header:

```
Authorization: Bearer <token>
```

### Request

```json
{
  "name": "John Doe",
  "password": "password"
}
```

### Response Body (success)

```json
{
  "content": {
    "id": "1",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "message": "Successfully updated user",
  "errors": []
}
```

### Response Body (error)

```json
{
  "content": null,
  "message": "User not found",
  "errors": []
}
```

## Logout User

Endpoint: `DELETE /api/users/logout`

Request Header:

```
Authorization: Bearer <token>
```

### Response Body (success)

```json
{
  "content": null,
  "message": "Successfully logged out",
  "errors": []
}
```
