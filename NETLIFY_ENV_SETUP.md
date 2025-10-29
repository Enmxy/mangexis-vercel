# Netlify Environment Variables Nasıl Eklenir?

## 📋 Adım Adım Rehber

### 1. Netlify Dashboard'a Git
https://app.netlify.com → Giriş yap

### 2. Site'ni Seç
- "Sites" sekmesinde **Mangexis** site'ini bul ve tıkla

### 3. Site Configuration'a Git
Sol menüden: **Site configuration** → **Environment variables**

### 4. Her Değişkeni Tek Tek Ekle

**"Add a variable" butonuna tıkla**, sonra şunları ekle:

---

#### Variable 1: GITHUB_TOKEN
```
Key: GITHUB_TOKEN
Value: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx
Scopes: All scopes (veya Production seç)
```
**Save** → Continue

---

#### Variable 2: REPO_OWNER
```
Key: REPO_OWNER
Value: Enmxy
Scopes: All scopes
```
**Save** → Continue

---

#### Variable 3: REPO_NAME
```
Key: REPO_NAME
Value: Mangexis
Scopes: All scopes
```
**Save** → Continue

---

#### Variable 4: ADMIN_USERNAME
```
Key: ADMIN_USERNAME
Value: admin
Scopes: All scopes
```
**Save** → Continue

---

#### Variable 5: ADMIN_PASSWORD
```
Key: ADMIN_PASSWORD
Value: mangexis2024
Scopes: All scopes
```
⚠️ **Güvenlik:** Production'da güçlü şifre kullan!

**Save** → Continue

---

#### Variable 6: JWT_SECRET
```
Key: JWT_SECRET
Value: mangexis-super-secret-jwt-key-2024-production-change-this
Scopes: All scopes
```
⚠️ **Önemli:** En az 32 karakter uzunluğunda olmalı!

**Save** → Continue

---

## 5. Deploy Trigger Et

Environment variables ekledikten sonra:
- **Deploys** sekmesine git
- **Trigger deploy** → **Clear cache and deploy site**

Veya:
```bash
git push
```

Deploy bittikten sonra (2-3 dakika) admin panel çalışacak!

---

## ✅ Kontrol Et

Deploy bitince:
1. https://mangexis.netlify.app/admin
2. Username: `admin`
3. Password: `mangexis2024`
4. Giriş yap!

---

## 🐛 Sorun mu var?

**401 Unauthorized:**
- Environment variables doğru girilmiş mi kontrol et
- Deploy yeniden tetikle (clear cache ile)

**404 Not Found:**
- Git push yapıldı mı kontrol et
- Netlify build logs'a bak

**Beyaz Ekran:**
- Browser console'a bak (F12)
- Netlify Function logs'a bak
