# MangeXis Admin Panel - Kurulum Rehberi

## 🚀 Netlify'de Deploy ve Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. GitHub'a Push Et

```bash
git add .
git commit -m "Add working admin panel with Netlify Functions"
git push
```

### 3. Netlify'de Site Oluştur

1. [app.netlify.com](https://app.netlify.com) → Giriş yap
2. **"Add new site"** → **"Import an existing project"**
3. **"Deploy with GitHub"** seçin
4. Repository'nizi seçin (`mangexis`)
5. Build settings otomatik doldurulacak:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
6. **"Deploy site"** butonuna tıklayın

### 4. Environment Variables Ekle

Netlify Dashboard → Site Settings → Environment variables:

#### **GITHUB_TOKEN** (Gerekli)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **"Generate new token (classic)"**
3. Scopes seçin:
   - ✅ `repo` (Full control of private repositories)
4. Token'ı kopyalayın
5. Netlify'de ekleyin: `GITHUB_TOKEN` = `ghp_xxxxx...`

#### **REPO_OWNER** (Gerekli)
- GitHub kullanıcı adınız
- Örnek: `REPO_OWNER` = `your-username`

#### **REPO_NAME** (Gerekli)
- Repository adı
- Örnek: `REPO_NAME` = `mangexis`

#### **IMGBB_API_KEY** (Opsiyonel - Image Upload için)
1. [imgbb.com](https://imgbb.com) → Kayıt ol
2. [API](https://api.imgbb.com/) → Get API Key
3. Netlify'de ekleyin: `IMGBB_API_KEY` = `xxxxx...`

### 5. Netlify Identity Aktifleştir

1. **Site Settings** → **Identity**
2. **"Enable Identity"** butonuna tıklayın
3. **Registration preferences** → **"Edit settings"**
   - **"Invite only"** seçin
4. **Save**

### 6. Git Gateway Aktifleştir

1. Identity sayfasında aşağı kaydırın
2. **"Services"** → **"Git Gateway"**
3. **"Enable Git Gateway"** butonuna tıklayın

### 7. Admin Kullanıcısı Ekle

1. **Identity** tab (üst menü)
2. **"Invite users"** butonuna tıklayın
3. Email adresinizi girin
4. Gelen maildeki linke tıklayın
5. Şifre oluşturun

### 8. Site'i Yeniden Deploy Et

Environment variables ekledikten sonra:
1. **Deploys** tab
2. **"Trigger deploy"** → **"Deploy site"**

---

## ✅ Admin Panel Kullanımı

### Giriş Yap
```
https://your-site.netlify.app/admin/login
```

### Özellikler

#### **1. Manga Ekleme**
- Dashboard → "Manga Ekle"
- Form doldurun:
  - Başlık (otomatik slug)
  - Kapak: URL gir VEYA dosya yükle 📁
  - Açıklama
  - Durum (Devam/Tamamlandı/Ara)
  - Fansub (opsiyonel)
  - Türler (hazır + özel)
  - Bölümler + Sayfalar
- **"Kaydet"** → Git'e commit atılır

#### **2. Manga Düzenleme**
- Mangalar sayfasında **"Düzenle"** butonuna tıkla
- Bilgileri güncelle
- Yeni bölüm ekle
- **"Güncelle"** → Değişiklikler commit edilir

#### **3. Manga Silme**
- Mangalar sayfasında **"🗑️"** butonuna tıkla
- Onay modalında **"Sil"**
- JSON dosyası silinir ve commit atılır

#### **4. Kapak Değiştirme**
- Düzenle sayfasında
- Yeni URL gir VEYA
- **"Yükle"** butonuna tıkla → Dosya seç
- Otomatik yüklenir ve URL güncellenir

#### **5. Bölüm Ekleme**
- Düzenle/Ekle sayfasında
- "Bölümler" bölümüne git
- Bölüm numarası gir
- Sayfa linklerini ekle (+ Sayfa Ekle)
- **"Bölüm Ekle"** butonuna tıkla

#### **6. Fansub Yönetimi**
- Manga eklerken/düzenlerken
- "Fansub/Çeviri Grubu" alanına grup adı gir
- Reader'da otomatik görünür

---

## 📖 Reader'da Fansub Seçimi

Eğer bir bölümde birden fazla fansub varsa:
- Reader'da kontrol barında fansub dropdown görünür
- Kullanıcı fansub seçebilir
- Sayfalar seçilen fansub'a göre değişir

---

## 🔧 Sorun Giderme

### "Unauthorized" Hatası
- Netlify Identity'de giriş yaptığınızdan emin olun
- Environment variables doğru mu kontrol edin

### "Upload failed" Hatası
- `IMGBB_API_KEY` eklenmiş mi kontrol edin
- ImgBB hesabınız aktif mi kontrol edin

### Manga kaydedilmiyor
- `GITHUB_TOKEN` doğru mu kontrol edin
- Token'ın `repo` yetkisi var mı kontrol edin
- `REPO_OWNER` ve `REPO_NAME` doğru mu kontrol edin

### Git Gateway hatası
- Netlify Dashboard → Identity → Services
- Git Gateway "Enabled" olmalı

### Functions çalışmıyor
- Netlify Dashboard → Functions tab
- Function loglarını kontrol edin
- Environment variables set edilmiş mi kontrol edin

---

## 📝 Önemli Notlar

### Development Mode
- Local'de (`npm run dev`) admin panel çalışır
- Kaydetme işlemleri console'a log yazılır
- Gerçek kaydetme için Netlify'de deploy gerekli

### Production Mode
- Netlify'de deploy edildikten sonra
- Tüm CRUD işlemleri gerçek çalışır
- Git'e otomatik commit atılır
- Manga dosyaları `src/data/mangas/` klasörüne kaydedilir

### Image Upload
- ImgBB ücretsiz (5MB limit)
- Alternatif: Cloudinary, Imgur kullanabilirsiniz
- `netlify/functions/upload-image.js` dosyasını düzenleyin

### Fansub Yapısı
```json
{
  "title": "Manga Adı",
  "fansub": "MangeXis Fansub",
  "chapters": [
    {
      "chapter": 1,
      "images": ["url1", "url2"],
      "fansubs": [
        {
          "name": "MangeXis",
          "images": ["url1", "url2"]
        },
        {
          "name": "Türk Anime TV",
          "images": ["url3", "url4"]
        }
      ]
    }
  ]
}
```

---

## 🎯 Sonraki Adımlar

1. ✅ Netlify'de deploy et
2. ✅ Environment variables ekle
3. ✅ Identity + Git Gateway aktifleştir
4. ✅ Admin kullanıcısı ekle
5. ✅ Site'i yeniden deploy et
6. ✅ Admin panele giriş yap
7. ✅ İlk mangayı ekle!

---

**MangeXis Admin Panel** - Tam çalışan, production-ready! 🚀
