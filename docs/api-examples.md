# Contoh Penggunaan API Todo List

Dokumen ini berisi contoh penggunaan API untuk aplikasi Todo List.

## Endpoints

### 1. Membuat Todo List Baru

**Request:**
```http
POST /api/v1/todos
Content-Type: application/json

{
  "expiration_hours": 24,
  "items": [
    {
      "content": "Membeli bahan masakan",
      "completed": false,
      "order": 0
    },
    {
      "content": "Mengerjakan laporan",
      "completed": false,
      "order": 1
    },
    {
      "content": "Meeting dengan tim",
      "completed": true,
      "order": 2
    }
  ]
}
```

**Response:**
```json
{
  "id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
  "edit_token": "6d90b7e2-a1b9-48a9-bfe9-c4d9d8c90123",
  "created_at": "2023-08-15T10:30:45Z",
  "expires_at": "2023-08-16T10:30:45Z",
  "items": [
    {
      "id": "item-1",
      "content": "Membeli bahan masakan",
      "completed": false,
      "order": 0,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-2",
      "content": "Mengerjakan laporan",
      "completed": false,
      "order": 1,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-3",
      "content": "Meeting dengan tim",
      "completed": true,
      "order": 2,
      "created_at": "2023-08-15T10:30:45Z"
    }
  ]
}
```

### 2. Mendapatkan Todo List

**Request:**
```http
GET /api/v1/todos/ae29f456-8d13-42fc-b356-9a5bc309ffb7
```

**Response:**
```json
{
  "id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
  "created_at": "2023-08-15T10:30:45Z",
  "expires_at": "2023-08-16T10:30:45Z",
  "items": [
    {
      "id": "item-1",
      "content": "Membeli bahan masakan",
      "completed": false,
      "order": 0,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-2",
      "content": "Mengerjakan laporan",
      "completed": false,
      "order": 1,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-3",
      "content": "Meeting dengan tim",
      "completed": true,
      "order": 2,
      "created_at": "2023-08-15T10:30:45Z"
    }
  ]
}
```

### 3. Mengupdate Todo List

**Request:**
```http
PUT /api/v1/todos/ae29f456-8d13-42fc-b356-9a5bc309ffb7?editToken=6d90b7e2-a1b9-48a9-bfe9-c4d9d8c90123
Content-Type: application/json

{
  "id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
  "items": [
    {
      "id": "item-1",
      "content": "Membeli bahan masakan",
      "completed": true,
      "order": 0,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-2",
      "content": "Mengerjakan laporan - revisi",
      "completed": false,
      "order": 1,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-4",
      "content": "Kirim email ke klien",
      "completed": false,
      "order": 2,
      "created_at": "2023-08-15T14:20:10Z"
    }
  ]
}
```

**Response:**
```json
{
  "id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
  "created_at": "2023-08-15T10:30:45Z",
  "updated_at": "2023-08-15T14:20:30Z",
  "expires_at": "2023-08-16T10:30:45Z",
  "items": [
    {
      "id": "item-1",
      "content": "Membeli bahan masakan",
      "completed": true,
      "order": 0,
      "created_at": "2023-08-15T10:30:45Z",
      "completed_at": "2023-08-15T14:20:30Z"
    },
    {
      "id": "item-2",
      "content": "Mengerjakan laporan - revisi",
      "completed": false,
      "order": 1,
      "created_at": "2023-08-15T10:30:45Z"
    },
    {
      "id": "item-4",
      "content": "Kirim email ke klien",
      "completed": false,
      "order": 2,
      "created_at": "2023-08-15T14:20:10Z"
    }
  ]
}
```

## Errors

### 1. Todo List Not Found

```json
{
  "error": "Todo list not found",
  "status": 404
}
```

### 2. Invalid Edit Token

```json
{
  "error": "Invalid edit token",
  "status": 401
}
```

### 3. Todo List Expired

```json
{
  "error": "Todo list has expired",
  "status": 410
}
```

## WebSocket Events

### Connect

```
ws://localhost:8080/api/v1/ws/ae29f456-8d13-42fc-b356-9a5bc309ffb7?clientId=browser-123
```

### Update Event

```json
{
  "type": "update",
  "data": {
    "id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
    "items": [
      {
        "id": "item-1",
        "content": "Membeli bahan masakan",
        "completed": true,
        "order": 0
      },
      {
        "id": "item-2",
        "content": "Mengerjakan laporan - revisi",
        "completed": false,
        "order": 1
      }
    ],
    "updated_by": "browser-456"
  }
}
``` 