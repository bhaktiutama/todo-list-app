# Contoh Penggunaan API Todo List

Dokumen ini berisi contoh penggunaan API untuk aplikasi Todo List.

## Backends API

Aplikasi ini mendukung dua backend API:

1. **Go Backend (Default)** - Backend original berbasis Go dengan penyimpanan Redis
2. **Supabase Backend** - Backend alternatif menggunakan Supabase dengan PostgreSQL

Untuk mengubah backend yang digunakan, set environment variable `NEXT_PUBLIC_BACKEND_PROVIDER`:

```
# Untuk Go Backend (default)
NEXT_PUBLIC_BACKEND_PROVIDER=go

# Untuk Supabase Backend
NEXT_PUBLIC_BACKEND_PROVIDER=supabase
```

## Endpoints Go Backend

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

## Endpoints Supabase Backend

### 1. Membuat Todo List Baru

**Request:**

```http
POST /rest/v1/todo_lists
Content-Type: application/json
apikey: [your-anon-key]

{
  "expires_at": "2023-08-16T10:30:45Z",
  "edit_token": "6d90b7e2-a1b9-48a9-bfe9-c4d9d8c90123"
}
```

Kemudian tambahkan items:

```http
POST /rest/v1/todo_items
Content-Type: application/json
apikey: [your-anon-key]

{
  "todo_list_id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
  "content": "Membeli bahan masakan",
  "completed": false,
  "order": 0
}
```

### 2. Mendapatkan Todo List

**Request:**

```http
GET /rest/v1/todo_lists?id=eq.ae29f456-8d13-42fc-b356-9a5bc309ffb7&select=*
apikey: [your-anon-key]
```

Kemudian dapatkan items:

```http
GET /rest/v1/todo_items?todo_list_id=eq.ae29f456-8d13-42fc-b356-9a5bc309ffb7&select=*&order=order.asc
apikey: [your-anon-key]
```

### 3. Mengupdate Todo List

Pertama verifikasi edit token:

```http
GET /rest/v1/todo_lists?id=eq.ae29f456-8d13-42fc-b356-9a5bc309ffb7&edit_token=eq.6d90b7e2-a1b9-48a9-bfe9-c4d9d8c90123&select=id
apikey: [your-anon-key]
```

Kemudian update items:

```http
PATCH /rest/v1/todo_items?id=eq.item-1
Content-Type: application/json
apikey: [your-anon-key]

{
  "content": "Membeli bahan masakan",
  "completed": true,
  "order": 0,
  "completed_at": "2023-08-15T14:20:30Z"
}
```

Untuk menambah item baru:

```http
POST /rest/v1/todo_items
Content-Type: application/json
apikey: [your-anon-key]

{
  "todo_list_id": "ae29f456-8d13-42fc-b356-9a5bc309ffb7",
  "content": "Kirim email ke klien",
  "completed": false,
  "order": 2
}
```

Untuk menghapus item:

```http
DELETE /rest/v1/todo_items?id=eq.item-3
apikey: [your-anon-key]
```

## Row Level Security (RLS)

Ketika menggunakan Supabase Backend, aplikasi ini mengimplementasikan Row Level Security (RLS) untuk memastikan pengguna hanya dapat melihat dan mengubah data mereka sendiri.

### Kebijakan RLS

Todo Lists:

1. Pengguna yang terotentikasi dapat melihat todo_lists miliknya sendiri
2. Pengguna yang terotentikasi dapat membuat todo_lists baru dan otomatis menjadi pemiliknya
3. Pengguna yang terotentikasi dapat mengupdate dan menghapus todo_lists miliknya sendiri

Todo Items:

1. Pengguna yang terotentikasi dapat melihat todo_items yang terkait dengan todo_lists miliknya
2. Pengguna yang terotentikasi dapat membuat todo_items baru untuk todo_lists miliknya
3. Pengguna yang terotentikasi dapat mengupdate dan menghapus todo_items dalam todo_lists miliknya

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

## Contoh Kode Penggunaan API di Frontend

```typescript
// Menggunakan factory pattern untuk memilih backend provider
import { todoApi } from '../services/api';

// Membuat todo list baru
const createTodoList = async () => {
  const response = await todoApi.createTodoList({
    expiration_hours: 24,
    items: [{ content: 'Task 1', completed: false, order: 0 }],
  });
  console.log('Created todo list:', response);
};

// Mendapatkan todo list
const getTodoList = async (id: string) => {
  const todoList = await todoApi.getTodoList(id);
  console.log('Retrieved todo list:', todoList);
};

// Mengupdate todo list
const updateTodoList = async (id: string, editToken: string, items: TodoItem[]) => {
  const updatedTodo = await todoApi.updateTodoList(id, editToken, { items });
  console.log('Updated todo list:', updatedTodo);
};
```
