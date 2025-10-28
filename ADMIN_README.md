# MangeXis Admin Panel

Premium manga yönetim paneli - Netlify Identity + Decap CMS ile entegre.

## 🚀 Özellikler

### Admin Panel
- **Netlify Identity** ile güvenli giriş
- **Decap CMS** entegrasyonu
- Manga ekleme, düzenleme, silme
- Bölüm yönetimi
- Responsive dark theme tasarım
- Real-time preview

### Tasarım
- Koyu tema (Dark Mode)
- Purple accent (#6B46FF)
- Smooth animasyonlar (Framer Motion)
- Mobile responsive
- Modern, minimalist UI

## 📁 Klasör Yapısı

```
src/
├── components/
│   └── admin/
│       └── AdminLayout.jsx          # Admin layout (sidebar + navbar)
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx           # Giriş sayfası
│       ├── Dashboard.jsx            # Dashboard
│       ├── MangaList.jsx            # Manga listesi
│       └── MangaForm.jsx            # Manga ekle/düzenle
├── data/
│   └── mangas/                      # Manga JSON dosyaları
│       ├── one-piece.json
│       ├── naruto.json
│       └── ...
public/
└── admin/
    ├── index.html                   # Decap CMS entry
    └── config.yml                   # CMS yapılandırması
```

## 🔧 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Netlify'de Projeyi Oluştur
1. GitHub'a push edin
2. Netlify'de "New site from Git" seçin
3. Repository'yi seçin
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. Netlify Identity'yi Aktifleştir
1. Netlify Dashboard → Site Settings → Identity
2. "Enable Identity" butonuna tıklayın
3. Registration preferences → "Invite only" seçin
4. External providers → İsterseniz Google/GitHub ekleyin
5. Services → Git Gateway → Enable Git Gateway

### 4. Admin Kullanıcısı Ekle
1. Identity tab → "Invite users"
2. Email adresinizi girin
3. Gelen maildeki linke tıklayıp şifre oluşturun

## 🎯 Kullanım

### Admin Panele Giriş
```
https://your-site.netlify.app/admin/login
```

### Decap CMS (Gelişmiş Düzenleme)
```
https://your-site.netlify.app/admin
```

### Manga Ekleme
1. Admin panel → "Manga Ekle"
2. Formu doldurun:
   - Başlık (otomatik slug oluşturulur)
   - Kapak URL
   - Açıklama
   - Durum (Devam Ediyor/Tamamlandı/Ara Verildi)
   - Türler (multiple select)
3. Bölüm ekleyin:
   - Bölüm numarası
   - Sayfa linkleri (+ ile yeni sayfa ekleyin)
4. "Kaydet" → Git'e commit atılır

### Manga Düzenleme
1. Manga listesinde "Düzenle" butonuna tıklayın
2. Bilgileri güncelleyin
3. Yeni bölüm ekleyin veya mevcut bölümleri silin
4. "Güncelle" → Değişiklikler commit edilir

### Manga Silme
1. Manga listesinde "🗑️" butonuna tıklayın
2. Onay modalında "Sil" butonuna tıklayın
3. JSON dosyası silinir ve commit atılır

## 📝 JSON Yapısı

Her manga `src/data/mangas/{slug}.json` olarak saklanır:

```json
{
  "title": "One Piece",
  "slug": "one-piece",
  "cover": "https://...",
  "description": "Açıklama...",
  "status": "ongoing",
  "genres": ["Aksiyon", "Macera", "Shounen"],
  "chapters": [
    {
      "chapter": 1,
      "images": [
        "https://i.ibb.co/page1.jpg",
        "https://i.ibb.co/page2.jpg"
      ]
    }
  ]
}
```

## 🎨 Tasarım Renkleri

```css
Background: #111827 (gray-900)
Cards: #1F2937 (gray-800)
Borders: #374151 (gray-700)
Text: #FFFFFF (white)
Secondary: #9CA3AF (gray-400)
Accent: #9333EA (purple-600)
Success: #10B981 (green-500)
Danger: #EF4444 (red-500)
```

## 🔐 Güvenlik

- Netlify Identity ile kimlik doğrulama
- Git Gateway ile güvenli commit
- Invite-only registration
- Role-based access (opsiyonel)

## 🚀 Deployment

### Otomatik Deploy
Her Git push'ta Netlify otomatik deploy eder:
1. `git add .`
2. `git commit -m "Update manga"`
3. `git push`

### Manuel Deploy
```bash
npm run build
netlify deploy --prod
```

## 📚 Decap CMS Kullanımı

Decap CMS daha gelişmiş düzenleme için kullanılabilir:

1. `/admin` adresine gidin
2. Netlify Identity ile giriş yapın
3. Collections → Manga
4. "New Manga" veya mevcut mangayı düzenleyin
5. Rich text editor, media library ve preview mevcut
6. "Publish" → Otomatik commit

## 🛠️ Geliştirme

```bash
# Development server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## 📖 API Referansı

### Netlify Identity Widget
```javascript
// Giriş modal aç
window.netlifyIdentity.open('login')

// Mevcut kullanıcı
const user = window.netlifyIdentity.currentUser()

// Çıkış
window.netlifyIdentity.logout()

// Event listeners
window.netlifyIdentity.on('login', user => {})
window.netlifyIdentity.on('logout', () => {})
```

## 🐛 Sorun Giderme

### Identity widget çalışmıyor
- `index.html`'de script tag'i kontrol edin
- Netlify Dashboard'da Identity aktif mi kontrol edin

### Git Gateway hatası
- Netlify Dashboard → Identity → Services → Git Gateway
- "Enable Git Gateway" butonuna tıklayın

### Manga kaydedilmiyor
- Browser console'da hata var mı kontrol edin
- Git Gateway aktif mi kontrol edin
- Kullanıcı yetkisi var mı kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Netlify build logs'u kontrol edin
3. GitHub Issues'da sorun açın

---

**MangeXis Admin Panel** - Premium manga yönetimi için tasarlandı 🚀
