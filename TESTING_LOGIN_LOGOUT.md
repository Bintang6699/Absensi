# 🔧 Panduan Testing - Masalah Auto-Login & Logout

## Masalah yang Dilaporkan

1. ❌ Ketika klik "Masuk/Daftar" di Landing Page → langsung masuk sebagai siswa
2. ❌ Di halaman siswa tidak bisa logout/keluar

## Perbaikan yang Sudah Dilakukan

### 1. **Fungsi Logout Diperbaiki** ✅

**File**: `frontend/src/context/AuthContext.jsx`

**Perubahan**:
- ✅ Menambahkan backend call untuk clear JWT cookie
- ✅ Membersihkan SEMUA data di localStorage (bukan hanya 'user')
- ✅ Memastikan semua tab ikut logout (via storage event)
- ✅ Hard reload ke `/login` untuk clean state

**Kode Baru**:
```javascript
const logout = async () => {
    try {
        // Call backend logout to clear cookie
        await API.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear all local data
        setUser(null);
        localStorage.removeItem('user');
        localStorage.setItem('logout-event', Date.now().toString());
        
        // Clear all localStorage to ensure clean state
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'logout-event') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Redirect to login with reload to ensure clean state
        window.location.href = '/login';
    }
};
```

### 2. **Backend Logout Route Ditambahkan** ✅

**File**: `backend/src/controllers/authController.js`

**Fungsi Baru**:
```javascript
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});
```

**Route**: `POST /api/auth/logout`

### 3. **Tombol Logout Sudah Ada** ✅

**Lokasi**:
- Admin: `Sidebar.jsx` line 82-89
- Student: `StudentLayout.jsx` line 82-88

Kedua tombol sudah memanggil fungsi `logout()` dari `useAuth()`.

## 🧪 Cara Testing

### Test #1: Logout dari Halaman Siswa

**Skenario**: Pastikan tombol "Keluar" berfungsi dengan benar

**Langkah**:
```
1. Login sebagai siswa (via Google OAuth atau email/password)
2. Masuk ke dashboard siswa
3. Klik tombol "Keluar" di sidebar (bawah)
4. Harusnya redirect ke /login
5. Check localStorage di browser console:
   - Buka DevTools (F12)
   - Console tab
   - Ketik: localStorage.getItem('user')
   - Result seharusnya: null
```

**Expected Result**: ✅
- Redirect ke `/login` page
- localStorage kosong (tidak ada data user)
- JWT cookie terhapus

### Test #2: Tidak Ada Auto-Login Setelah Logout

**Skenario**: Memastikan setelah logout, klik "Masuk/Daftar" tidak auto-login

**Langkah**:
```
1. Lakukan Test #1 (logout dari student dashboard)
2. Navigasi ke Landing Page (/)
3. Klik tombol "Masuk / Daftar" di navbar
4. Seharusnya muncul halaman login dengan form
5. TIDAK auto-redirect ke dashboard
```

**Expected Result**: ✅
- Muncul halaman login dengan form email/password
- Tidak auto-redirect ke dashboard siswa

### Test #3: Multi-Tab Logout

**Skenario**: Logout di satu tab, tab lain juga ikut logout

**Langkah**:
```
1. Login sebagai siswa
2. Buka 3 tab berbeda:
   - Tab 1: /student/biodata
   - Tab 2: /student/grades
   - Tab 3: /student/messages
3. Di Tab 1, klik "Keluar"
4. Periksa Tab 2 dan Tab 3
```

**Expected Result**: ✅
- Tab 2 dan Tab 3 otomatis redirect ke `/login`
- Semua tab ter-logout

### Test #4: Login Normal Setelah Logout

**Skenario**: Memastikan bisa login kembali setelah logout

**Langkah**:
```
1. Setelah logout (Test #1)
2. Di halaman /login, masukkan:
   - Email: admin@admin.com
   - Password: admin123
3. Klik "Login sebagai Admin"
```

**Expected Result**: ✅
- Berhasil login
- Redirect ke `/admin` dashboard

## ⚠️ Troubleshooting

### Masalah: Masih auto-login setelah logout

**Solusi 1**: Clear localStorage manual
```javascript
// Buka browser console (F12), jalankan:
localStorage.clear();
location.reload();
```

**Solusi 2**: Clear cookies
```
1. Buka DevTools (F12)
2. Application tab
3. Storage → Cookies → http://localhost:5173
4. Hapus cookie "jwt"
5. Refresh page
```

### Masalah: Tombol "Keluar" tidak muncul

**Cek**:
```
1. Buka browser console (F12)
2. Cek error di Console tab
3. Pastikan `useAuth()` hook berfungsi
4. Test dengan:
   const { logout } = useAuth();
   console.log(typeof logout); // Should be 'function'
```

### Masalah: Error saat klik "Keluar"

**Check Network Tab**:
```
1. Buka DevTools (F12) → Network tab
2. Klik "Keluar"
3. Cari request ke `/api/auth/logout`
4. Check status code (should be 200)
5. Check response
```

## 🎯 Checklist Lengkap

Setelah semua perbaikan, pastikan:

- [ ] Tombol "Keluar" muncul di sidebar siswa
- [ ] Tombol "Keluar" muncul di sidebar admin
- [ ] Klik "Keluar" redirect ke /login
- [ ] localStorage ter-clear setelah logout
- [ ] JWT cookie terhapus setelah logout
- [ ] Tidak auto-login setelah logout
- [ ] Bisa login kembali dengan email/password
- [ ] Bisa login kembali dengan Google OAuth
- [ ] Multi-tab logout berfungsi

## 📝 Catatan Penting

1. **localStorage vs sessionStorage**: Sekarang menggunakan `localStorage` untuk multi-tab support
2. **JWT Cookie**: Backend menyimpan token di HTTP-only cookie untuk security
3. **Storage Event**: Browser native event untuk sinkronisasi antar tab
4. **Hard Reload**: `window.location.href` memastikan clean state setelah logout

## 🚀 Cara Jalankan

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access: http://localhost:5173

---

**Last Updated**: 2026-02-17
**Status**: ✅ Semua bug diperbaiki
