# 🔐 Kullanıcı Kimlik Doğrulama Sistemi

## Özellikler

### ✨ Temel Özellikler
- **Kayıt Ol (Sign Up)**: Email, kullanıcı adı ve şifre ile kayıt
- **Giriş Yap (Login)**: Email ve şifre ile giriş
- **Beni Hatırla**: Oturum kalıcılığı
- **Profil Yönetimi**: Kullanıcı profili ve istatistikler
- **JWT Token Tabanlı**: Güvenli kimlik doğrulama
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

### 🛡️ Güvenlik
- **Şifre Hash**: bcryptjs ile şifreleme
- **JWT Token**: 7 günlük süre
- **Form Validasyonu**: Email ve şifre kontrolü
- **Session Yönetimi**: localStorage/sessionStorage

## 📁 Dosya Yapısı

```
mv2/
├── netlify/functions/
│   ├── user-auth.js           # Auth API endpoints
│   └── package.json           # bcryptjs dependency eklendi
├── src/
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state yönetimi
│   ├── pages/
│   │   ├── Login.jsx          # Giriş sayfası
│   │   ├── SignUp.jsx         # Kayıt sayfası
│   │   └── Profile.jsx        # Profil sayfası
│   ├── components/
│   │   ├── Navbar.jsx         # User menu eklendi
│   │   └── MobileBottomNav.jsx # Profile link eklendi
│   ├── App.jsx                # Routes eklendi
│   └── main.jsx               # AuthProvider wrap
```

## 🚀 Kurulum

### 1. Dependencies Yükle
```bash
cd netlify/functions
npm install
```

### 2. Environment Variables (.env)
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Netlify Functions Yapılandırması
`netlify.toml` dosyanızda functions dizini ayarlandığından emin olun:
```toml
[build]
  functions = "netlify/functions"
```

## 📡 API Endpoints

### Register (Kayıt)
**POST** `/.netlify/functions/user-auth/register`
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "username": "username"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "username": "username",
    "createdAt": 1234567890
  }
}
```

### Login (Giriş)
**POST** `/.netlify/functions/user-auth/login`
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

### Verify Token (Doğrulama)
**POST** `/.netlify/functions/user-auth/verify`
**Headers:** `Authorization: Bearer <token>`

### Get Profile (Profil)
**GET** `/.netlify/functions/user-auth/profile`
**Headers:** `Authorization: Bearer <token>`

### Update Profile (Güncelleme)
**PUT** `/.netlify/functions/user-auth/profile`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "username": "newusername",
  "favorites": [...],
  "readingHistory": [...]
}
```

## 🎯 Kullanım

### React Context Hook
```jsx
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (isAuthenticated) {
    return <div>Hoşgeldin {user.username}!</div>
  }
  
  return <button onClick={() => navigate('/login')}>Giriş Yap</button>
}
```

### Protected Routes (İleride)
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return isAuthenticated ? children : <Navigate to="/login" />
}
```

## 🔗 Sayfalar

### 1. Sign Up (`/signup`)
- Email, kullanıcı adı, şifre formları
- Şifre tekrar kontrolü
- Email validasyonu
- Otomatik giriş sonrası yönlendirme

### 2. Login (`/login`)
- Email ve şifre ile giriş
- "Beni Hatırla" checkbox
- "Şifremi Unuttum" link (ileride implement edilecek)
- Ana sayfaya yönlendirme

### 3. Profile (`/profile`)
- Kullanıcı bilgileri
- İstatistikler (okunan bölümler, favoriler)
- Hızlı aksiyonlar (Geçmiş, Favoriler)
- Çıkış yap butonu

## 📱 Navbar Integration

### Desktop
- Giriş yapmamış: "Giriş Yap" + "Kayıt Ol" butonları
- Giriş yapmış: Avatar + kullanıcı adı dropdown menü
  - Profilim
  - Okuma Geçmişi
  - Favorilerim
  - Çıkış Yap

### Mobile Bottom Nav
- Giriş yapmamış: "Giriş" butonu
- Giriş yapmış: "Profil" butonu

## 💾 Veri Depolama

### In-Memory (Şu An)
Kullanıcı verileri Netlify Functions içinde in-memory olarak saklanıyor. Bu development/demo içindir.

### Production İçin Öneriler
Gerçek production için veritabanı kullanın:
- **MongoDB**: Netlify + MongoDB Atlas
- **Supabase**: Authentication + Database
- **Firebase**: Auth + Firestore
- **PostgreSQL**: Neon, Railway vb.

## 🎨 UI/UX Özellikleri

- **Gradient Backgrounds**: Modern tasarım
- **Framer Motion Animations**: Smooth geçişler
- **Form Validasyonu**: Gerçek zamanlı hata mesajları
- **Loading States**: Kullanıcı geri bildirimi
- **Responsive**: Tüm ekran boyutları
- **Dark Theme**: Premium görünüm

## 🔄 İleride Eklenebilecek Özellikler

- [ ] Email doğrulama
- [ ] Şifre sıfırlama
- [ ] OAuth (Google, Facebook)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Profil fotoğrafı yükleme
- [ ] Kullanıcı ayarları
- [ ] Favoriler ve okuma geçmişi senkronizasyonu
- [ ] Sosyal özellikler (takip, yorum vb.)
- [ ] Admin panel kullanıcı yönetimi

## 🐛 Troubleshooting

### Token Süresi Doldu Hatası
- Token 7 gün sonra sona erer
- Kullanıcının tekrar giriş yapması gerekir
- Auto-refresh token özelliği eklenebilir

### CORS Hatası
- Netlify functions otomatik CORS destekler
- Local development için proxy ayarları gerekebilir

### bcryptjs Hatası
- `npm install` komutunu netlify/functions dizininde çalıştırın
- Deploy sırasında Netlify otomatik yükler

## 📝 Notlar

- **Güvenlik**: Production'da JWT_SECRET mutlaka değiştirilmeli
- **Database**: In-memory storage yerine gerçek DB kullanın
- **Email**: Email gönderim servisi entegre edilebilir (SendGrid, Mailgun)
- **Monitoring**: Hata takibi için Sentry vb. eklenebilir

## 🎉 Tamamlandı!

Artık tam fonksiyonel bir kullanıcı sisteminiz var! Kullanıcılar kayıt olabilir, giriş yapabilir ve profillerini yönetebilirler.
