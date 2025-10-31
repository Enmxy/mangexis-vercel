# 🚀 Vercel Backend Kurulum Rehberi

## 📋 Oluşturduğunuz Değerler

### Admin Hash
```
$2a$12$R2w.KL5RXPxxzKjbhXSxTHYhnkMPnQ
```
**Şifre:** `134790Emre2012/8`

## 🔧 Vercel Dashboard Kurulumu

### 1. Vercel'e Gidin
https://vercel.com/dashboard

### 2. Projenizi Seçin
`mangexis-vercel` → **Settings** → **Environment Variables**

### 3. Değişkenleri Ekleyin

#### JWT_SECRET
```
Key: JWT_SECRET
Value: skxN78zUPchPxHgUNRcSwqAn9iT1obPcK54W72wkbWAs/G+/v/DB9as2NyoqGBs1LqBlU1OsePyd4w66gNrAow==
Environments: ✅ Production ✅ Preview ✅ Development
```

#### ADMIN_USERNAME
```
Key: ADMIN_USERNAME
Value: admin
Environments: ✅ All
```

#### ADMIN_PASSWORD_HASH
```
Key: ADMIN_PASSWORD_HASH
Value: $2a$12$R2w.KL5RXPxxzKjbhXSxTHYhnkMPnQ
Environments: ✅ All
```

#### FANSUB_USERNAME
```
Key: FANSUB_USERNAME
Value: fansub
Environments: ✅ All
```

#### FANSUB_PASSWORD_HASH (aynı şifre kullanabilirsiniz)
```
Key: FANSUB_PASSWORD_HASH
Value: $2a$12$R2w.KL5RXPxxzKjbhXSxTHYhnkMPnQ
Environments: ✅ All
```

#### GITHUB_TOKEN
```
Key: GITHUB_TOKEN
Value: <GitHub Personal Access Token>
Environments: ✅ All
```

**GitHub Token Almak İçin:**
1. https://github.com/settings/tokens
2. Generate new token (classic)
3. ✅ repo + ✅ workflow yetkisi
4. Token'ı kopyala

#### REPO_OWNER
```
Key: REPO_OWNER
Value: Enmxy
Environments: ✅ All
```

#### REPO_NAME
```
Key: REPO_NAME
Value: mangexis-vercel
Environments: ✅ All
```

## 4. Kod Güncellemelerini Push Edin

```bash
git add .
git commit -m "feat: Vercel backend tamamen yapılandırıldı"
git push
```

## 5. Redeploy Yapın

1. **Deployments** sekmesine gidin
2. En son deployment → **⋯** (üç nokta)
3. **Redeploy**
4. ⚠️ **"Use existing Build Cache"** seçeneğini KALDIRIN
5. **Redeploy** butonuna tıklayın

Deploy 2-3 dakika sürer.

## 6. Test Edin

### Admin Panel
```
URL: https://your-project.vercel.app/admin
Username: admin
Password: 134790Emre2012/8
```

### Fansub Panel
```
URL: https://your-project.vercel.app/admin
Username: fansub
Password: 134790Emre2012/8
```

## ✅ Kontrol Listesi

- [ ] 8 environment variable eklendi
- [ ] Her değişken için Production + Preview + Development seçildi
- [ ] Kod push edildi
- [ ] Redeploy yapıldı (build cache temizlendi)
- [ ] Admin panele giriş yapıldı
- [ ] API çalışıyor

---

**Başarılar! 🎉**
