# 🚀 Vercel'e Deployment Rehberi

Bu rehber, MangeXis projenizin Vercel'e nasıl deploy edileceğini adım adım açıklar.

## 📋 Ön Hazırlık

### 1. Gerekli Hesaplar
- ✅ [Vercel Hesabı](https://vercel.com/signup) (GitHub ile giriş yapabilirsiniz)
- ✅ GitHub Hesabı (projeniz burada olmalı)
- ✅ GitHub Personal Access Token
- ✅ ImgBB API Key (resim yükleme için - opsiyonel)

### 2. GitHub Personal Access Token Oluşturma
1. GitHub'da **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token** butonuna tıklayın
3. Token için bir isim verin: `mangexis-vercel`
4. Şu yetkileri seçin:
   - ✅ `repo` (tüm repo erişimi)
   - ✅ `workflow`
5. **Generate token** butonuna tıklayın
6. ⚠️ Token'ı kopyalayın ve güvenli bir yere kaydedin (bir daha göremezsiniz!)

## 🔧 Vercel'e Deploy Adımları

### Adım 1: Projeyi Vercel'e Bağlama

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. **Add New** → **Project** seçin
3. GitHub repository'nizi seçin (mangexis)
4. **Import** butonuna tıklayın

### Adım 2: Proje Ayarları

#### Framework Preset
- **Framework Preset:** Vite seçin (otomatik algılanmalı)

#### Build & Output Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Root Directory
- Root directory olarak `.` (varsayılan) kullanın

### Adım 3: Environment Variables (Çevre Değişkenleri) Ekleme

**Environment Variables** bölümünde aşağıdaki değişkenleri ekleyin:

#### 🔐 Güvenlik (ZORUNLU)
```
JWT_SECRET=your_random_64_character_secret_key_here
```
**Nasıl oluşturulur:**
```bash
# Linux/Mac:
openssl rand -base64 64

# Node.js ile:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### 👤 Admin Hesabı (ZORUNLU)
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
```

**Şifre hash'i nasıl oluşturulur:**
```bash
# Projenizi klonladıktan sonra:
cd netlify/functions
node generate-password-hash.cjs YourStrongPassword123!
# Çıktıyı kopyalayın ve ADMIN_PASSWORD_HASH'e yapıştırın
```

#### 👥 Fansub Hesabı (ZORUNLU)
```
FANSUB_USERNAME=fansub
FANSUB_PASSWORD_HASH=your_bcrypt_hash_here
```

#### 🐙 GitHub Entegrasyonu (ZORUNLU)
```
GITHUB_TOKEN=ghp_your_github_personal_access_token
REPO_OWNER=Enmxy
REPO_NAME=Mangexis
```

#### 🖼️ ImgBB API (Opsiyonel - Resim yükleme için)
```
IMGBB_API_KEY=your_imgbb_api_key
```
[ImgBB'den ücretsiz API key alın](https://api.imgbb.com/)

### Adım 4: Deploy Butonu

Tüm ayarları yaptıktan sonra **Deploy** butonuna tıklayın!

## ⏱️ İlk Deploy Süreci

- ⏰ İlk deploy 2-5 dakika sürebilir
- 📊 Build loglarını izleyebilirsiniz
- ✅ Başarılı olursa yeşil "Ready" mesajı göreceksiniz
- 🌐 Size bir URL verilecek: `your-project-name.vercel.app`

## 🔍 Deploy Sonrası Kontroller

### 1. Frontend Kontrolü
```
https://your-project-name.vercel.app/
```
Ana sayfa açılmalı

### 2. Admin Panel Kontrolü
```
https://your-project-name.vercel.app/admin
```
Admin login sayfası açılmalı

### 3. API Kontrolü
```
https://your-project-name.vercel.app/api/manga-operations
```
POST isteği ile test edin (body: `{"operation": "GET_ALL_MANGAS"}`)

## 🔄 Otomatik Deployment

Vercel, GitHub'daki her push ile otomatik deploy yapar:

- **main/master branch** → Production deployment
- **Diğer branch'ler** → Preview deployment

Her commit için benzersiz bir URL alırsınız!

## 🐛 Sorun Giderme

### Hata: "Module not found"
**Çözüm:** 
```bash
# package.json'da tüm dependencies var mı kontrol edin
npm install
```

### Hata: "API returns 500"
**Çözüm:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Tüm değişkenlerin doğru girildiğinden emin olun
3. Özellikle `GITHUB_TOKEN` ve `JWT_SECRET` kontrol edin
4. Redeploy yapın

### Hata: "Unauthorized"
**Çözüm:**
- `ADMIN_PASSWORD_HASH` doğru şekilde oluşturulmuş mu?
- `JWT_SECRET` ayarlandı mı?

### API çalışmıyor
**Çözüm:**
1. Browser Console'da hataları kontrol edin (F12)
2. Vercel Functions logs'ları inceleyin:
   - Dashboard → Project → Functions → Logs

## 📱 Custom Domain Ekleme (Opsiyonel)

1. Vercel Dashboard → Project → Settings → Domains
2. Domain adınızı girin (örn: mangexis.com)
3. DNS kayıtlarını güncelleyin (Vercel size talimat verir)
4. ✅ SSL sertifikası otomatik kurulur

## 🔒 Güvenlik Tavsiyeleri

- ✅ Güçlü şifreler kullanın
- ✅ JWT_SECRET'ı kimseyle paylaşmayın
- ✅ Environment variables'ı GitHub'a pushlamamayın
- ✅ Düzenli olarak GitHub token'larını yenileyin
- ✅ Admin şifresini periyodik olarak değiştirin

## 📈 Production Optimizasyonları

### 1. Analytics Ekleme
```javascript
// Vercel Analytics (ücretsiz)
npm install @vercel/analytics
```

### 2. Image Optimization
Vercel otomatik olarak resimleri optimize eder.

### 3. Caching
`vercel.json` dosyasında cache ayarları yapılandırılmıştır.

## 🆘 Destek ve Yardım

- 📚 [Vercel Documentation](https://vercel.com/docs)
- 💬 [Vercel Community](https://github.com/vercel/vercel/discussions)
- 📧 Vercel Support (vercel.com/support)

## 🎉 Başarılı Deploy Sonrası

Tebrikler! Siteniz artık yayında:

1. ✅ `https://your-project.vercel.app` URL'sini ziyaret edin
2. ✅ Admin panel'e giriş yapın
3. ✅ İlk manga'yı ekleyin
4. ✅ Sosyal medyada paylaşın! 🎊

---

**İyi kullanımlar! 🚀**
