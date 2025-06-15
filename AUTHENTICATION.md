# Sistem Autentikasi FinTrack

## Overview

Sistem autentikasi ini menggunakan kombinasi middleware server-side dan client-side protection untuk mengamankan rute aplikasi.

## Komponen Utama

### 1. Middleware (`middleware.js`)
- Berjalan di server-side
- Memeriksa token dari cookies
- Melindungi semua rute kecuali `/auth`
- Redirect user yang belum login ke `/auth`
- Redirect user yang sudah login dari `/auth` ke dashboard

### 2. ProtectedRoute Component (`components/ProtectedRoute.jsx`)
- Client-side protection
- Menampilkan loading spinner saat mengecek autentikasi
- Redirect ke `/auth` jika tidak terautentikasi

### 3. useAuth Hook (`hooks/useAuth.js`)
- Custom hook untuk mengelola status autentikasi
- Mengecek token dari localStorage dan cookies
- Menyediakan fungsi logout

### 4. Cookie Utilities (`lib/cookies.js`)
- Utility functions untuk mengelola cookies
- `setCookie()`: Menyimpan cookie
- `getCookie()`: Mengambil nilai cookie
- `deleteCookie()`: Menghapus cookie

## Alur Kerja

### Login
1. User mengisi form login
2. Token disimpan di localStorage dan cookies
3. User diarahkan ke dashboard

### Logout
1. Token dihapus dari localStorage dan cookies
2. User diarahkan ke halaman auth

### Akses Rute
1. **Server-side**: Middleware memeriksa token di cookies
2. **Client-side**: ProtectedRoute memeriksa status autentikasi
3. Jika tidak terautentikasi, redirect ke `/auth`

## Rute yang Dilindungi

- `/` (Dashboard)
- `/transactions`
- `/reports`
- `/budgets`
- `/categories`

## Rute Publik

- `/auth` (Login/Register)

## Keamanan

- Token disimpan dengan flag `secure` dan `samesite=strict`
- Middleware berjalan di server-side untuk keamanan tambahan
- Client-side protection untuk UX yang lebih baik
- Token otomatis expired setelah 24 jam

## Penggunaan

### Menambahkan Rute Terlindungi
Rute baru akan otomatis terlindungi oleh middleware dan ProtectedRoute.

### Menambahkan Rute Publik
Tambahkan path ke array `publicRoutes` di `middleware.js`:

```javascript
const publicRoutes = ['/auth', '/public-page']
```

### Mengecek Status Autentikasi di Komponen
```javascript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Not authenticated</div>
  
  return <div>Protected content</div>
}
``` 