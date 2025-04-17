# Panduan Migrasi ke Supabase

Dokumen ini berisi langkah-langkah untuk migrasi dari backend Go ke Supabase, atau untuk setup Supabase dari awal.

## Konfigurasi Database Schema

### 1. Membuat Tabel

Login ke Dashboard Supabase, buka SQL Editor, dan jalankan query berikut:

```sql
-- Buat tabel todo_lists
CREATE TABLE public.todo_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  edit_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Buat tabel todo_items
CREATE TABLE public.todo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_list_id UUID REFERENCES public.todo_lists(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Buat index untuk meningkatkan performa query
CREATE INDEX idx_todo_items_todo_list_id ON public.todo_items(todo_list_id);
CREATE INDEX idx_todo_lists_user_id ON public.todo_lists(user_id);
CREATE INDEX idx_todo_lists_expires_at ON public.todo_lists(expires_at);
```

## Konfigurasi Frontend

### 1. Buat file `lib/supabase.ts` di folder frontend

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Update file `.env.local`

```
# Menggunakan Supabase Backend
NEXT_PUBLIC_BACKEND_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Migrasi Data (Opsional)

Jika Anda perlu memigrasikan data dari backend Go dengan Redis ke Supabase, berikut adalah langkah-langkahnya:

1. **Export data dari Redis**

   Buat script sederhana untuk mengekspor semua data todo list dari Redis:

   ```go
   // export_redis.go
   package main

   import (
     "encoding/json"
     "fmt"
     "os"
     "github.com/go-redis/redis/v8"
     "context"
   )

   func main() {
     ctx := context.Background()

     // Connect to Redis
     rdb := redis.NewClient(&redis.Options{
       Addr:     os.Getenv("REDIS_URL"),
       Password: os.Getenv("REDIS_PASSWORD"),
       DB:       0,
     })

     // Get all todo list keys
     keys, err := rdb.Keys(ctx, "todo:*").Result()
     if err != nil {
       panic(err)
     }

     // Create output file
     f, err := os.Create("todos_export.json")
     if err != nil {
       panic(err)
     }
     defer f.Close()

     // Export each todo list
     todos := []map[string]interface{}{}

     for _, key := range keys {
       val, err := rdb.Get(ctx, key).Result()
       if err != nil {
         fmt.Printf("Error getting %s: %v\n", key, err)
         continue
       }

       var todo map[string]interface{}
       if err := json.Unmarshal([]byte(val), &todo); err != nil {
         fmt.Printf("Error unmarshaling %s: %v\n", key, err)
         continue
       }

       todos = append(todos, todo)
     }

     // Write to file
     encoder := json.NewEncoder(f)
     encoder.SetIndent("", "  ")
     if err := encoder.Encode(todos); err != nil {
       panic(err)
     }

     fmt.Printf("Exported %d todo lists to todos_export.json\n", len(todos))
   }
   ```

2. **Import data ke Supabase**

   Buat script untuk mengimpor data ke Supabase:

   ```typescript
   // import_to_supabase.ts
   import { createClient } from '@supabase/supabase-js';
   import fs from 'fs';

   const supabaseUrl = process.env.SUPABASE_URL!;
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
   const supabase = createClient(supabaseUrl, supabaseServiceKey);

   async function importData() {
     // Read exported data
     const data = JSON.parse(fs.readFileSync('todos_export.json', 'utf8'));

     for (const todo of data) {
       // Create todo list
       const { data: todoList, error: todoError } = await supabase
         .from('todo_lists')
         .insert({
           id: todo.id,
           user_id: todo.user_id || '00000000-0000-0000-0000-000000000000', // Default user if none
           edit_token: todo.edit_token,
           created_at: todo.created_at,
           expires_at: todo.expires_at,
         })
         .select()
         .single();

       if (todoError) {
         console.error(`Error creating todo list ${todo.id}:`, todoError);
         continue;
       }

       // Create todo items
       if (todo.items && todo.items.length > 0) {
         const { error: itemsError } = await supabase.from('todo_items').insert(
           todo.items.map((item: any, index: number) => ({
             id: item.id,
             todo_list_id: todo.id,
             content: item.content,
             completed: item.completed,
             order: item.order || index,
             created_at: item.created_at,
             completed_at: item.completed_at,
           }))
         );

         if (itemsError) {
           console.error(`Error creating items for todo list ${todo.id}:`, itemsError);
         }
       }

       console.log(`Imported todo list ${todo.id} with ${todo.items?.length || 0} items`);
     }

     console.log(`Import complete. Imported ${data.length} todo lists.`);
   }

   importData().catch(console.error);
   ```

## Troubleshooting

### 1. Temporary ID Error

Jika mengalami error saat menambahkan item baru:

```
invalid input syntax for type uuid: "temp-1234567890"
```

Solusi: Update kode SupabaseTodoApi untuk menangani temporary ID sebagai berikut:

```typescript
// Pisahkan item menjadi existing items dan new items
const existingItems = request.items.filter((item) => item.id && !item.id.startsWith('temp-'));
const newItems = request.items.filter((item) => !item.id || item.id.startsWith('temp-'));

// Update existing items
for (const item of existingItems) {
  // Update code...
}

// Insert new items
if (newItems.length > 0) {
  const { error } = await supabase.from('todo_items').insert(
    newItems.map((item) => ({
      todo_list_id: id,
      content: item.content,
      completed: item.completed,
      order: item.order,
    }))
  );

  if (error) throw new Error('Failed to create items');
}
```

### 2. RLS Error

Jika items tidak muncul atau tidak dapat diupdate karena RLS, periksa:

1. Pastikan user_id di todo_lists terupdate dengan benar
2. Pastikan kebijakan RLS sudah diaktifkan dengan benar
3. Cek log SQL di Supabase Dashboard untuk melihat query yang ditolak

### 3. Migrasi Webhook (Jika Diperlukan)

Jika Anda menggunakan fitur webhook di backend Go, Anda perlu mengimplementasikan ulang menggunakan Supabase Edge Functions:

1. Setup Supabase CLI
2. Buat edge function baru
3. Deploy ke Supabase
