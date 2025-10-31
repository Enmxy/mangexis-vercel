# 🎌 MangeXis - Modern Manga Okuma Platformu (Vercel Sürümü)

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

> Modern, hızlı ve kullanıcı dostu manga okuma platformu - Vercel ile deploy edilmeye hazır!

## ✨ Özellikler

### 🎨 Kullanıcı Özellikleri
- 📚 Modern manga okuma arayüzü
- 🌓 Dark/Light mode desteği
- 📱 Responsive tasarım (mobil uyumlu)
- 🔖 Favori manga listesi
- 📰 Haber ve duyurular
- 🎭 Özel sayfalar (Hakkımızda, İletişim, vb.)
- 💬 Giscus ile yorum sistemi

### 🛠️ Admin Panel Özellikleri
- ✅ Güvenli admin girişi (JWT + bcrypt)
- 📖 Manga ekleme/düzenleme/silme
- 📑 Bölüm yönetimi
- 📰 Haber yönetimi
- 🎭 Özel sayfa oluşturucu
- 🎪 Slider yönetimi
- 👥 İki seviye yetki (Admin + Fansub)

### 🔒 Güvenlik
- JWT token tabanlı kimlik doğrulama
- bcrypt şifre hashleme
- Rate limiting
- IP bazlı lockout sistemi
- Session timeout
- Güvenlik logları

## 🚀 Hızlı Başlangıç

### 1. Yeni Repository Oluşturun
```bash
# GitHub'da yeni repository oluşturun (boş repo)
# Repository adı: mangexis-vercel
```

### 2. Projeyi Klonlayın/İndirin
```bash
git clone https://github.com/SIZIN_KULLANICI_ADINIZ/mangexis-vercel.git
cd mangexis-vercel
```

### 3. Dependencies Kurun
```bash
npm install
```

### 4. Local Development
```bash
# Development server başlatın
npm run dev

# http://localhost:3000 adresinde açılacak
```

### 5. Vercel'e Deploy
Detaylı talimatlar için: **[YENI_REPO_KURULUM.md](./YENI_REPO_KURULUM.md)**

#### Hızlı Deploy:
1. Kodu GitHub'a push edin
2. [Vercel](https://vercel.com/new) üzerinden repository'yi import edin
3. Environment variables ekleyin
4. Deploy!

## 📦 Proje Yapısı

```
mangexis-vercel/
├── api/                          # Vercel Serverless Functions
│   ├── admin-auth.js            # Admin kimlik doğrulama
│   ├── manga-operations.js      # Manga CRUD
│   ├── news-operations.js       # Haber işlemleri
│   ├── custom-pages.js          # Özel sayfalar
│   ├── slider-operations.js     # Slider yönetimi
│   └── upload-image.js          # Resim yükleme
├── src/
│   ├── components/              # React bileşenleri
│   ├── pages/                   # Sayfa bileşenleri
│   │   ├── admin/              # Admin panel sayfaları
│   │   └── ...                 # Diğer sayfalar
│   ├── utils/                   # Yardımcı fonksiyonlar
│   ├── data/                    # Statik veriler
│   └── context/                 # React Context
├── public/                      # Statik dosyalar
├── vercel.json                  # Vercel yapılandırması
├── package.json
└── README.md
```

## 🔐 Environment Variables

Vercel Dashboard'da aşağıdaki değişkenleri ayarlamalısınız:

```env
# Güvenlik
JWT_SECRET=your_64_character_random_secret

# Admin Hesabı
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=bcrypt_hash_here

# Fansub Hesabı
FANSUB_USERNAME=fansub
FANSUB_PASSWORD_HASH=bcrypt_hash_here

# GitHub Integration
GITHUB_TOKEN=your_github_token
REPO_OWNER=your_github_username
REPO_NAME=your_repo_name

# Image Upload (Opsiyonel)
IMGBB_API_KEY=your_imgbb_api_key
```

**Detaylı açıklamalar:** [VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)

## 🔧 Şifre Hash Oluşturma

```bash
cd netlify/functions
node generate-password-hash.cjs YourPassword123!
```

## 📚 Dokümantasyon

- **[YENI_REPO_KURULUM.md](./YENI_REPO_KURULUM.md)** - Yeni repo oluşturma ve deploy
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Detaylı deployment rehberi
- **[VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)** - Environment variables açıklamaları

## 🛡️ Güvenlik Özellikleri

### Rate Limiting
- 15 dakikada maksimum 10 istek
- Aşım durumunda 15 dakika blok

### IP Lockout
- 5 başarısız giriş denemesi
- 30 dakika hesap kilidi

### Session Management
- 2 saatlik session timeout
- Otomatik token yenileme
- Güvenli logout

## 🎯 Admin Panel Kullanımı

### Login
```
URL: https://your-site.vercel.app/admin
Username: admin (veya belirlediğiniz)
Password: Belirlediğiniz şifre
```

### Manga Ekleme
1. Admin Panel → Manga Yönetimi → Yeni Manga
2. Bilgileri doldurun
3. Kaydet

### Bölüm Ekleme
1. Admin Panel → Bölüm Ekle
2. Manga seçin
3. Bölüm numarası ve resimleri ekleyin
4. Kaydet

## 🎨 Özelleştirme

### Renk Teması
`tailwind.config.js` dosyasında renkler özelleştirilebilir.

### Logo ve Favicon
`public/` klasöründeki dosyaları değiştirin.

### Slider
Admin Panel → Slider Yönetimi'nden düzenleyin.

## 📱 Responsive Design

- 📱 Mobile: 320px+
- 📱 Tablet: 768px+
- 💻 Desktop: 1024px+
- 🖥️ Large Desktop: 1920px+

## 🔄 Otomatik Deployment

Her GitHub push ile otomatik deploy:
```bash
git add .
git commit -m "feat: yeni özellik"
git push
# Vercel otomatik deploy yapar!
```

## 🐛 Sorun Giderme

### Build Hatası
```bash
# Dependencies'i yeniden kurun
rm -rf node_modules package-lock.json
npm install
```

### API Çalışmıyor
1. Vercel Dashboard → Functions → Logs
2. Environment variables kontrolü
3. GitHub token yetkilerini kontrol

### Login Olmuyor
1. ADMIN_PASSWORD_HASH doğru mu?
2. JWT_SECRET ayarlandı mı?
3. Browser Console (F12) kontrol edin

## 📊 Teknolojiler

- **Frontend:** React 18, Vite 5, TailwindCSS
- **Animation:** Framer Motion
- **Routing:** React Router v6
- **Backend:** Vercel Serverless Functions
- **Auth:** JWT + bcrypt
- **Database:** GitHub (JSON storage)
- **Hosting:** Vercel
- **Comments:** Giscus

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'feat: amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request oluşturun

## 📄 Lisans

MIT License

## 🆘 Destek

- 📚 [Vercel Docs](https://vercel.com/docs)
- 💬 [GitHub Issues](https://github.com/your-username/mangexis-vercel/issues)
- 📧 Email: your-email@example.com

## 🎉 Credits

MangeXis tarafından geliştirilmiştir.

---

**Deploy ve iyi kullanımlar! 🚀**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/mangexis-vercel)
