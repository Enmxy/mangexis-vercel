# Admin Panel Setup Guide

## 🔐 Backend Admin Sistemi

MangeXis artık **gerçek backend** ile çalışan bir admin paneline sahip!

### 🚀 Özellikler

- ✅ **JWT Token Authentication** - Güvenli giriş sistemi
- ✅ **Netlify Functions** - Serverless backend
- ✅ **GitHub API Integration** - Manga verisi GitHub'da saklanır
- ✅ **CORS Koruması** - Güvenli API endpoint'leri
- ✅ **Token Validation** - Her istekte token kontrolü

---

## 📦 Kurulum

### 1. Netlify Functions Paketlerini Yükle

```bash
cd netlify/functions
npm install
cd ../..
```

### 2. Environment Variables (Netlify Dashboard)

Netlify Dashboard → Site Settings → Environment Variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
GITHUB_TOKEN=your_github_personal_access_token
REPO_OWNER=Enmxy
REPO_NAME=Mangexis
```

#### GitHub Token Oluşturma:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Permissions: `repo` (Full control of private repositories)
4. Token'ı kopyala ve `GITHUB_TOKEN` olarak ekle

---

## 🔧 API Endpoints

### Authentication

**POST** `/.netlify/functions/admin-auth`

```json
// Login
{
  "action": "login",
  "username": "admin",
  "password": "mangexis2024"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "username": "admin", "role": "admin" }
}
```

```json
// Verify Token
{
  "action": "verify"
}
// Headers: Authorization: Bearer <token>
```

### Manga Management

**GET** `/.netlify/functions/admin-manga`
- Headers: `Authorization: Bearer <token>`
- Returns: Manga data from GitHub

**POST** `/.netlify/functions/admin-manga`
```json
// Add Manga
{
  "action": "add",
  "manga": { ... }
}

// Update Manga
{
  "action": "update",
  "manga": { ... }
}

// Delete Manga
{
  "action": "delete",
  "manga": { "slug": "manga-slug" }
}
```

---

## 🔑 Default Credentials

**Kullanıcı Adı:** `admin`  
**Şifre:** `mangexis2024`

⚠️ **Önemli:** Production'da mutlaka değiştir!

---

## 🛠️ Nasıl Çalışır?

1. **Login:**
   - Admin username/password ile giriş
   - Backend JWT token oluşturur (7 gün geçerli)
   - Token localStorage'da saklanır

2. **Authentication:**
   - Her API isteğinde token gönderilir
   - Backend token'ı doğrular
   - Geçersiz/expired token → 401 Unauthorized

3. **Manga CRUD:**
   - Admin manga ekler/düzenler/siler
   - Backend GitHub API kullanır
   - `mangaData.js` dosyasını günceller
   - Otomatik commit & push

---

## 🔒 Güvenlik

- ✅ JWT token (7 gün expiry)
- ✅ CORS protection
- ✅ Environment variables (credentials gizli)
- ✅ GitHub API authentication
- ✅ Token verification her istekte
- ✅ HTTPS (Netlify otomatik)

---

## 📝 Geliştirme

Local'de test için:

```bash
# Netlify CLI yükle
npm install -g netlify-cli

# Dev server başlat
netlify dev
```

Functions: `http://localhost:8888/.netlify/functions/`

---

## ⚡ Deploy

```bash
git add .
git commit -m "Add backend admin system"
git push
```

Netlify otomatik deploy eder. Environment variables'ları unutma!

---

## 🐛 Troubleshooting

**401 Unauthorized:**
- Token expired → Tekrar login
- Environment variables eksik → Netlify dashboard'da kontrol et

**Failed to load Giscus:**
- CSP headers güncel mi kontrol et
- `netlify.toml` giscus.app izinleri var mı?

**GitHub API Error:**
- `GITHUB_TOKEN` geçerli mi?
- Token permissions: `repo` var mı?

---

## 📚 Teknolojiler

- **Backend:** Netlify Functions (Serverless)
- **Auth:** JSON Web Tokens (JWT)
- **Database:** GitHub API (Git as CMS)
- **Security:** CORS, Environment Variables
- **Frontend:** React + adminApi.js

---

**Sorular?** GitHub Issues'da sor: https://github.com/Enmxy/Mangexis/issues
