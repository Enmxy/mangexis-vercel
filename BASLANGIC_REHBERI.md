# 🚀 Hızlı Başlangıç Rehberi

## 📋 Özet

Projeniz Vercel'e deploy edilmeye hazır! Bu rehber ile 10 dakikada yayına alabilirsiniz.

## ⚡ Hızlı Adımlar (10 Dakika)

### 1️⃣ Şifre Hash'lerini Oluşturun (2 dk)

```bash
cd netlify/functions
node generate-password-hash.cjs AdminSifreniz123!
```
**Çıktıyı kopyalayın** → Bu admin şifre hash'iniz

```bash
node generate-password-hash.cjs FansubSifreniz456!
```
**Çıktıyı kopyalayın** → Bu fansub şifre hash'iniz

### 2️⃣ GitHub Token Alın (2 dk)

1. https://github.com/settings/tokens
2. **Generate new token (classic)**
3. İsim: `mangexis-vercel`
4. Yetkiler: ✅ `repo` + ✅ `workflow`
5. **Generate** → Token'ı kopyalayın

### 3️⃣ Yeni GitHub Repo Oluşturun (1 dk)

1. https://github.com/new
2. İsim: `mangexis-vercel`
3. **Boş repo** (hiçbir şey eklemeyin)
4. Create repository

### 4️⃣ Kodu Push Edin (2 dk)

```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/KULLANICI_ADINIZ/mangexis-vercel.git
git branch -M main
git push -u origin main
```

**⚠️ KULLANICI_ADINIZ'ı kendi kullanıcı adınızla değiştirin!**

### 5️⃣ Vercel'e Deploy (3 dk)

1. https://vercel.com/new → GitHub ile giriş yapın
2. Repository seçin → **Import**
3. **Environment Variables** ekleyin:

```env
JWT_SECRET=<openssl rand -base64 64 çıktısı>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<Adım 1'den aldığınız hash>
FANSUB_USERNAME=fansub
FANSUB_PASSWORD_HASH=<Adım 1'den aldığınız hash>
GITHUB_TOKEN=<Adım 2'den aldığınız token>
REPO_OWNER=<GitHub kullanıcı adınız>
REPO_NAME=mangexis-vercel
```

4. **Deploy** butonuna tıklayın!

---

## ✅ Deploy Tamamlandı!

Siteniz 2-5 dakikada hazır olacak. URL'niz:
```
https://your-project-name.vercel.app
```

### 🎯 İlk Giriş

Admin Panel:
```
URL: https://your-project-name.vercel.app/admin
Kullanıcı: admin
Şifre: Adım 1'de belirlediğiniz şifre
```

---

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için:
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Detaylı checklist
- **[YENI_REPO_KURULUM.md](./YENI_REPO_KURULUM.md)** - Tam rehber
- **[GIT_COMMANDS.md](./GIT_COMMANDS.md)** - Git komutları
- **[VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)** - Environment variables

---

## 🆘 Sorun mu Yaşıyorsunuz?

### Build Hatası
```bash
npm install
git add package-lock.json
git commit -m "fix: dependencies"
git push
```

### Login Olmuyor
1. ADMIN_PASSWORD_HASH doğru mu? (bcrypt hash olmalı)
2. JWT_SECRET ayarlandı mı?
3. Browser Console (F12) kontrol edin

### API Hatası
1. Vercel Dashboard → Functions → Logs
2. GITHUB_TOKEN doğru mu?
3. REPO_OWNER ve REPO_NAME doğru mu?

---

## 🎉 Başarılar!

Projeniz artık yayında! 🚀

Sonraki adımlar:
1. İlk manga'nızı ekleyin
2. Ayarları özelleştirin
3. Kullanıcılarla paylaşın

**İyi kullanımlar!** ⭐
