# 🆕 Yeni Repository ve Vercel Kurulum Rehberi

## 📋 1. GitHub'da Yeni Repository Oluşturma

1. GitHub'a gidin: https://github.com/new
2. Repository bilgileri:
   - **Repository name:** `mangexis-vercel` (veya istediğiniz isim)
   - **Description:** "MangeXis - Modern Manga Okuma Platformu"
   - **Visibility:** Private veya Public (tercihinize göre)
   - **✅ ÖNEMLI:** "Add a README file" seçeneğini **İŞARETLEMEYİN** (boş repo olacak)
   - **✅ ÖNEMLI:** .gitignore ve license **EKLEMEYİN** (bizde zaten var)
3. **Create repository** butonuna tıklayın

## 🔧 2. Projeyi Yeni Repo'ya Push Etme

Proje klasöründe şu komutları çalıştırın:

```bash
# Git'i başlatın (eğer yoksa)
git init

# Tüm dosyaları staging area'ya ekleyin
git add .

# İlk commit'i yapın
git commit -m "feat: Vercel deployment için proje hazırlandı"

# Yeni repository'yi remote olarak ekleyin (URL'i kendi repo URL'niz ile değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/mangexis-vercel.git

# Main branch'e push edin
git branch -M main
git push -u origin main
```

**⚠️ ÖNEMLİ:** `KULLANICI_ADINIZ` ve `mangexis-vercel` kısmını kendi bilgilerinizle değiştirin!

## 🔐 3. Environment Variables Hazırlama

Deploy etmeden önce bu bilgileri hazırlamalısınız:

### A. JWT Secret Oluştur
```bash
# PowerShell'de:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```
Çıktıyı bir yere kaydedin.

### B. Admin Şifre Hash'i Oluştur
```bash
cd netlify/functions
node generate-password-hash.cjs SifreNiz123!
```
Çıkan hash'i kaydedin.

### C. Fansub Şifre Hash'i Oluştur
```bash
node generate-password-hash.cjs FansubSifresi456!
```
Çıkan hash'i kaydedin.

### D. GitHub Token Oluştur
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)**
3. Token adı: `mangexis-vercel`
4. Yetkiler:
   - ✅ `repo` (tüm repo yetkisi)
   - ✅ `workflow`
5. Token'ı kopyalayın

## 🚀 4. Vercel'e Deploy

### Adım 1: Vercel'e Gidin
https://vercel.com/new

### Adım 2: Repository'yi Import Edin
1. "Import Git Repository" seçin
2. Yeni oluşturduğunuz repository'yi seçin
3. **Import** butonuna tıklayın

### Adım 3: Proje Ayarları
- **Framework Preset:** Vite (otomatik seçilmeli)
- **Root Directory:** `.` (varsayılan)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Adım 4: Environment Variables Ekleyin

Şu 8 değişkeni ekleyin:

```env
JWT_SECRET=<Adım 3A'dan aldığınız değer>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<Adım 3B'den aldığınız hash>
FANSUB_USERNAME=fansub
FANSUB_PASSWORD_HASH=<Adım 3C'den aldığınız hash>
GITHUB_TOKEN=<Adım 3D'den aldığınız token>
REPO_OWNER=KULLANICI_ADINIZ
REPO_NAME=mangexis-vercel
```

**⚠️ DİKKAT:** 
- Her değişken için "Production, Preview, Development" ortamlarının hepsini seçin
- `REPO_OWNER` ve `REPO_NAME` değerlerini kendi bilgilerinizle değiştirin!

### Adım 5: Deploy Butonuna Tıklayın!
- Deploy işlemi 2-5 dakika sürer
- Build loglarını izleyin
- ✅ "Completed" mesajı geldiğinde deploy tamamdır

## 🎯 5. Deploy Sonrası Test

### Frontend Testi
```
https://your-project.vercel.app/
```
Ana sayfa açılmalı.

### Admin Panel Testi
```
https://your-project.vercel.app/admin
```
Admin giriş sayfası açılmalı.

### API Testi
```
https://your-project.vercel.app/api/manga-operations
```
POST request ile test yapabilirsiniz.

### Admin Girişi
1. Admin panele gidin
2. Username: `admin`
3. Password: Adım 3B'de belirlediğiniz şifre
4. Login yapın

## 📊 6. Otomatik Deployment

Artık her kod değişikliğinde otomatik deploy olacak:

```bash
# Değişiklikleri yapın
git add .
git commit -m "feat: yeni özellik eklendi"
git push

# Vercel otomatik olarak deploy eder!
```

## 🔍 7. Vercel Dashboard Özellikleri

### Deployment Logs
- Project → Deployments → Son deployment → View Logs

### Function Logs
- Project → Functions → Logs
- API hatalarını buradan görebilirsiniz

### Analytics
- Project → Analytics
- Ziyaretçi istatistikleri

### Domains
- Project → Settings → Domains
- Custom domain ekleyebilirsiniz

## ⚠️ Önemli Notlar

### .gitignore Kontrolü
Bu dosyalar **asla** push edilmemeli:
- `.env`
- `node_modules/`
- `dist/`
- `.netlify/`

### Güvenlik
- ✅ Environment variables'ı sadece Vercel'de saklayın
- ✅ Şifreleri GitHub'a pushlamamayın
- ✅ `.env.example` dosyasını örnek olarak kullanın

### REPO_OWNER ve REPO_NAME
Bu değerler **çok önemli**! Manga verilerini burada saklayacak:
- `REPO_OWNER`: GitHub kullanıcı adınız
- `REPO_NAME`: Repository adınız

## 🐛 Sorun Giderme

### "Module not found" Hatası
```bash
# package.json kontrol edin
npm install
git add package-lock.json
git commit -m "fix: dependencies güncellendi"
git push
```

### "Unauthorized" Hatası
- Environment variables doğru mu?
- ADMIN_PASSWORD_HASH doğru oluşturulmuş mu?

### GitHub API Hatası
- GITHUB_TOKEN geçerli mi?
- Token'ın repo yetkisi var mı?
- REPO_OWNER ve REPO_NAME doğru mu?

## 📞 Destek

Sorun yaşarsanız:
1. Vercel Dashboard → Logs kontrol edin
2. Browser Console (F12) hatalarını kontrol edin
3. `VERCEL_DEPLOYMENT.md` dosyasına bakın

---

**Başarılar! 🚀**
