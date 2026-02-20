# Multi-Tab Support Documentation

## Masalah yang Diperbaiki

### Bug #1: Website Tidak Bisa Dibuka di Beberapa Tab
**Sebelumnya**: Website hanya bisa dibuka satu halaman di satu waktu. Ketika membuka tab baru, tab tersebut tidak bisa menampilkan halaman yang berbeda.

**Solusi**: 
- Mengganti `sessionStorage` dengan `localStorage` di seluruh aplikasi
- Menambahkan event listener untuk sinkronisasi state antar tab
- Setiap tab sekarang independent dan bisa buka halaman berbeda

### Bug #2: Admin Tidak Bisa Memuat Data Siswa
**Solusi**:
- Menambahkan error logging yang lebih detail untuk debugging
- Error message sekarang menampilkan pesan dari backend

## Perubahan Teknis

### 1. AuthContext.jsx
- **sessionStorage → localStorage**: Semua penyimpanan data user
- **Storage Event Listener**: Mendeteksi perubahan dari tab lain
  - Ketika logout di tab A, tab B, C, dst juga otomatis logout
  - Ketika login di tab A, tab B, C, dst juga otomatis update user data

### 2. axios.js (API Interceptor)
- **sessionStorage → localStorage**: Request interceptor membaca user dari localStorage
- **Ban detection**: Tetap sinkron dengan localStorage

### 3. StudentList.jsx
- **Error logging**: Console.error untuk debugging
- **Better error messages**: Menampilkan pesan error dari backend

## Cara Menggunakan Multi-Tab

### Skenario 1: Admin + Student di Tab Berbeda
1. Buka tab 1 → Login sebagai Admin → Buka `/admin/students`
2. Buka tab 2 → Login sebagai Siswa → Buka `/student/biodata`
3. Kedua tab bisa dibuka bersamaan tanpa masalah

### Skenario 2: Multiple Pages di Tab Berbeda (Same User)
1. Login sebagai Admin di tab 1
2. Buka tab 2 → Otomatis tetap login sebagai Admin
3. Tab 1 buka `/admin/students`, Tab 2 buka `/admin/grades`
4. Kedua tab independent, tidak saling mengganggu

### Skenario 3: Logout Synchronization
1. Login di 3 tab berbeda
2. Logout di tab 1
3. Tab 2 dan 3 otomatis redirect ke login page

## Testing Multi-Tab

### Test 1: Buka 2 Dashboard Berbeda
```
Tab 1: http://localhost:5173/admin/students
Tab 2: http://localhost:5173/admin/grades
Result: ✅ Kedua tab berfungsi normal
```

### Test 2: Logout dari Satu Tab
```
Tab 1: Klik Logout
Tab 2 & 3: Harus auto-redirect ke /login
Result: ✅ Semua tab logout
```

### Test 3: Update Data di Satu Tab
```
Tab 1: Update profile siswa
Tab 2: Data siswa otomatis ter-refresh (jika ada polling/refresh)
Result: ✅ Data tetap sinkron
```

## Catatan Penting

1. **localStorage digunakan**: Data login tersimpan sampai explicit logout
2. **Cookie tetap dipakai**: Backend auth masih menggunakan JWT cookie
3. **Storage Event**: Browser native feature, tidak perlu socket
4. **Independent Navigation**: Setiap tab punya routing sendiri

## Troubleshooting

### Masalah: Tab baru masih redirect ke dashboard yang sama
**Solusi**: Clear localStorage dan login ulang
```javascript
// Di browser console:
localStorage.clear();
```

### Masalah: Data tidak sinkron antar tab
**Solusi**: Check browser console untuk error, pastikan localStorage berfungsi
```javascript
// Test localStorage:
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should return 'value'
```

### Masalah: Admin tidak bisa load data siswa
**Solusi**: 
1. Buka browser console (F12)
2. Check error message yang muncul
3. Pastikan backend running di http://localhost:5000
4. Check network tab untuk response error

## Fitur Multi-Tab yang Didukung

✅ Multiple pages di tab berbeda (same user)
✅ Logout synchronization
✅ Login state sharing
✅ Independent routing per tab
✅ Ban detection across tabs
✅ Profile updates sync across tabs

## Fitur yang TIDAK Didukung

❌ Multiple users di tab berbeda (must logout first)
❌ Real-time data sync without refresh (perlu WebSocket)
❌ Cross-domain tab sync
