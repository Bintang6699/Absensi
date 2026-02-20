# Solusi Technical: Dual-Tab Authentication

## ⚠️ WARNING: TIDAK RECOMMENDED UNTUK PRODUCTION

Solusi ini memungkinkan login Admin dan Siswa di tab berbeda, tapi dengan trade-offs:

**Trade-offs**:
- ❌ Session tidak persist setelah refresh (harus re-login)
- ❌ Tidak ada sync antar tab untuk user yang sama
- ❌ Security concerns (mixing admin & student sessions)
- ❌ Confusing UX untuk end-users

## Implementasi

### Option A: SessionStorage (Tab-Isolated)

**Ubah**: `frontend/src/context/AuthContext.jsx`

```javascript
// BEFORE (localStorage - shared across tabs)
localStorage.setItem('user', JSON.stringify(data));

// AFTER (sessionStorage - isolated per tab)
sessionStorage.setItem('user', JSON.stringify(data));
```

**Ganti semua**:
- `localStorage.getItem('user')` → `sessionStorage.getItem('user')`
- `localStorage.setItem('user', ...)` → `sessionStorage.setItem('user', ...)`
- `localStorage.removeItem('user')` → `sessionStorage.removeItem('user')`

**Hasil**:
- ✅ Tab 1 (Admin) dan Tab 2 (Siswa) independent
- ❌ Refresh page = harus login ulang
- ❌ Buka tab baru = harus login ulang

### Option B: Hybrid Approach (Tab ID)

**Konsep**: Tambahkan unique tab ID untuk isolate state

```javascript
// Generate unique tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = 'tab_' + Date.now() + '_' + Math.random();
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

// Store user with tab namespace
const tabId = getTabId();
localStorage.setItem(`user_${tabId}`, JSON.stringify(userData));

// Retrieve user for current tab only
const storedUser = localStorage.getItem(`user_${tabId}`);
```

**Pros**:
- ✅ Tab-isolated sessions
- ✅ Persist after refresh (within same tab)

**Cons**:
- ❌ Complex implementation
- ❌ Multiple tokens in localStorage (cleanup needed)
- ❌ Still share same JWT cookie (conflict tetap ada)

### Option C: Token in URL Query (Not Recommended)

```javascript
// Login → redirect dengan token di URL
window.location.href = `/admin?token=${jwtToken}`;

// Read token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
```

**Pros**:
- ✅ Tab-isolated

**Cons**:
- ❌❌ SECURITY RISK: Token exposed di URL
- ❌ Token visible in browser history
- ❌ NOT RECOMMENDED FOR PRODUCTION

## 🎯 RECOMMENDED APPROACH

**Untuk Development/Testing**: Gunakan **Browser Profiles** atau **Incognito Mode**

**Untuk Production**: 
1. **Pisahkan aplikasi**: 
   - `admin.yoursite.com` untuk Admin
   - `student.yoursite.com` untuk Siswa
   - Subdomain memiliki cookie yang terpisah

2. **Atau gunakan path-based routing dengan warning**:
   - Show modal: "You're logged in as Admin in another tab. Logout first?"
   - Enforce single session per browser

## 🚀 Implementasi Subdomain (Production Ready)

### Backend Changes

```javascript
// Set cookie dengan domain specific
res.cookie('jwt', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  domain: '.yoursite.com', // Share across subdomains
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
```

### Frontend Changes

```javascript
// Admin app deployed to: admin.yoursite.com
// Student app deployed to: student.yoursite.com
// API: api.yoursite.com

// Cookies akan isolated karena berbeda subdomain
```

### Deployment Structure

```
admin.yoursite.com    → Frontend Admin (Vite build)
student.yoursite.com  → Frontend Student (Vite build)
api.yoursite.com      → Backend API (Node.js)
```

## 💡 Best Practice

1. **Development**: 
   - Use Chrome Profile 1 for Admin testing
   - Use Chrome Profile 2 for Student testing

2. **Production**:
   - Separate apps by subdomain
   - Or enforce single session per browser
   - Show clear user role indicator

3. **Security**:
   - Never mix admin & student sessions in same browser
   - Use role-based access control (RBAC)
   - Log all admin actions

## ⚠️ Kesimpulan

**Jangan implement dual-session di production!**

Gunakan solusi praktis:
- Development → Browser Profiles
- Production → Separate subdomains atau enforce single session
