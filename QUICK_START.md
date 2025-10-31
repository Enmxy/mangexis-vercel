# ⚡ Quick Start - 5 Dakikada Deploy

## 1️⃣ Şifre Hash'lerini Oluştur (1 dk)

```bash
npm run generate-hash YourStrongPassword123!
```
**Admin hash'ini kopyala** ✅

```bash
npm run generate-hash FansubSifresi456!
```
**Fansub hash'ini kopyala** ✅

## 2️⃣ GitHub Token Al (1 dk)

https://github.com/settings/tokens → **Generate new token (classic)**
- ✅ `repo` yetkisi
- Token'ı kopyala

## 3️⃣ Vercel'e Deploy (3 dk)

### A. Import Et
https://vercel.com/new → Repository seçin → **Import**

### B. Environment Variables Ekle

```env
JWT_SECRET=<node -e "..." çıktısı>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<adım 1'den>
FANSUB_USERNAME=fansub
FANSUB_PASSWORD_HASH=<adım 1'den>
GITHUB_TOKEN=<adım 2'den>
REPO_OWNER=Enmxy
REPO_NAME=mangexis-vercel
```

### C. Deploy!

**Deploy** butonuna tıkla → 2-3 dakika bekle → ✅ TAMAM!

## 🎯 Test Et

```
https://your-project.vercel.app/admin
```

**Username:** `admin`  
**Password:** Adım 1'de belirlediğiniz şifre

---

**Başarılar! 🚀**
