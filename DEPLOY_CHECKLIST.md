# ✅ Vercel Deployment Checklist

Bu checklist'i adım adım takip ederek projenizi başarıyla deploy edebilirsiniz.

## 📝 Ön Hazırlık

### 1. Gerekli Değerleri Hazırlayın

#### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```
- [ ] JWT Secret oluşturuldu ve kaydedildi

#### Admin Şifre Hash
```bash
cd netlify/functions
node generate-password-hash.cjs SifreNiz123!
```
- [ ] Admin şifre hash'i oluşturuldu ve kaydedildi
- [ ] Şifreyi bir yere not ettiniz (giriş yapmak için gerekli)

#### Fansub Şifre Hash
```bash
node generate-password-hash.cjs FansubSifresi456!
```
- [ ] Fansub şifre hash'i oluşturuldu ve kaydedildi
- [ ] Şifreyi bir yere not ettiniz

#### GitHub Token
- [ ] GitHub → Settings → Developer settings → Personal access tokens
- [ ] Token oluşturuldu (repo + workflow yetkileri ile)
- [ ] Token kopyalandı ve kaydedildi

---

## 🆕 GitHub Repository

### 2. Yeni Repository Oluşturun

- [ ] GitHub'da yeni repository oluşturuldu
- [ ] Repository adı belirlendi (örn: `mangexis-vercel`)
- [ ] **Boş repo** (README, .gitignore eklenmedi)
- [ ] Public veya Private seçildi
- [ ] Repository URL'i kopyalandı

---

## 💻 Local Git İşlemleri

### 3. Kodu Hazırlayın

```bash
# Git başlat (eğer yoksa)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "feat: Vercel deployment için proje hazırlandı"

# Remote ekle (URL'i değiştirin!)
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git

# Ana branch'i main yap
git branch -M main

# Push et
git push -u origin main
```

Checklist:
- [ ] Git init yapıldı
- [ ] Dosyalar commit edildi
- [ ] Remote repository eklendi
- [ ] Main branch'e push edildi
- [ ] GitHub'da kod görünüyor

---

## 🚀 Vercel Deployment

### 4. Vercel'e Import Edin

- [ ] https://vercel.com/new adresine gidildi
- [ ] GitHub ile login yapıldı
- [ ] Repository seçildi ve import edildi

### 5. Proje Ayarları

Build Settings:
- [ ] Framework Preset: **Vite** (otomatik seçilmeli)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Root Directory: `.` (varsayılan)

---

## 🔐 Environment Variables

### 6. Zorunlu Değişkenleri Ekleyin

Her değişken için **Production + Preview + Development** seçin!

#### Güvenlik
- [ ] `JWT_SECRET` = (64 karakter secret - Adım 1'den)

#### Admin Hesabı
- [ ] `ADMIN_USERNAME` = `admin` (veya özel kullanıcı adınız)
- [ ] `ADMIN_PASSWORD_HASH` = (bcrypt hash - Adım 1'den)

#### Fansub Hesabı
- [ ] `FANSUB_USERNAME` = `fansub`
- [ ] `FANSUB_PASSWORD_HASH` = (bcrypt hash - Adım 1'den)

#### GitHub Entegrasyonu
- [ ] `GITHUB_TOKEN` = (GitHub token - Adım 1'den)
- [ ] `REPO_OWNER` = (GitHub kullanıcı adınız)
- [ ] `REPO_NAME` = (Repository adınız)

#### Opsiyonel
- [ ] `IMGBB_API_KEY` = (ImgBB API key - resim yükleme için)

**⚠️ ÖNEMLİ:** `REPO_OWNER` ve `REPO_NAME` değerlerini doğru girin!

---

## 🎯 Deploy

### 7. Deploy Butonuna Basın

- [ ] "Deploy" butonuna tıklandı
- [ ] Build logları izleniyor
- [ ] Build başarılı ("Completed" mesajı)
- [ ] Site URL'i alındı

---

## ✅ Test

### 8. Site Testleri

#### Ana Sayfa
- [ ] `https://your-project.vercel.app/` açılıyor
- [ ] Slider çalışıyor
- [ ] Manga listesi görünüyor

#### Admin Panel
- [ ] `https://your-project.vercel.app/admin` açılıyor
- [ ] Login formu görünüyor
- [ ] Admin kullanıcı adı ve şifre ile giriş yapılıyor
- [ ] Admin dashboard açılıyor

#### API Test
```bash
# Postman veya browser console'dan test:
fetch('https://your-project.vercel.app/api/manga-operations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ operation: 'GET_ALL_MANGAS' })
}).then(r => r.json()).then(console.log)
```
- [ ] API yanıt veriyor
- [ ] Hata yok

#### Fonksiyon Test
- [ ] Manga ekleme çalışıyor
- [ ] Bölüm ekleme çalışıyor
- [ ] Haber ekleme çalışıyor
- [ ] Slider düzenleme çalışıyor

---

## 📊 İzleme

### 9. Vercel Dashboard

#### Logs
- [ ] Deployment logs kontrol edildi
- [ ] Function logs kontrol edildi
- [ ] Hata yok

#### Analytics
- [ ] Analytics açık (opsiyonel)
- [ ] Ziyaretçi takibi aktif

---

## 🎨 Özelleştirme (Opsiyonel)

### 10. Custom Domain

- [ ] Domain satın alındı
- [ ] Vercel → Settings → Domains
- [ ] Domain eklendi
- [ ] DNS kayıtları güncellendi
- [ ] SSL sertifikası aktif

---

## 🔄 Otomatik Deploy Test

### 11. Kod Değişikliği Test

```bash
# Küçük bir değişiklik yapın
echo "# Test" >> README.md

# Commit ve push
git add .
git commit -m "test: otomatik deploy testi"
git push
```

- [ ] GitHub'a push yapıldı
- [ ] Vercel otomatik deploy başladı
- [ ] Deploy başarılı
- [ ] Değişiklikler sitede görünüyor

---

## 📝 Son Kontroller

- [ ] Tüm sayfalar açılıyor
- [ ] Admin panel çalışıyor
- [ ] Manga ekleme/düzenleme/silme çalışıyor
- [ ] Responsive (mobil) görünüm doğru
- [ ] Hızlı yükleniyor
- [ ] Konsolda kritik hata yok

---

## 🎉 Tamamlandı!

Tebrikler! Siteniz başarıyla deploy edildi.

### Sonraki Adımlar:
1. İlk manga'nızı ekleyin
2. Sosyal medyada paylaşın
3. Kullanıcı geri bildirimlerini toplayın
4. Gerekirse özelleştirmeler yapın

### Faydalı Linkler:
- 🌐 Siteniz: `https://your-project.vercel.app`
- 🔐 Admin: `https://your-project.vercel.app/admin`
- 📊 Dashboard: `https://vercel.com/dashboard`
- 📚 Docs: `VERCEL_DEPLOYMENT.md`

---

**Başarılar! 🚀**
