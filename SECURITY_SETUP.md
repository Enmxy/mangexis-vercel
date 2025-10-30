# 🔒 MangeXis Güvenlik Kurulumu

## ⚠️ KRİTİK GÜVENLİK UYARILARI

Bu dokümandaki adımları **MUTLAKA** takip edin. Aksi halde sisteminiz savunmasız kalır!

---

## 🛡️ Güvenlik Özellikleri

### ✅ Mevcut Korumalar

1. **Bcrypt Şifre Hashleme** (12 rounds - çok güçlü)
2. **JWT Token Authentication** 
3. **Brute Force Koruması** (5 deneme sonra 30 dk kilit)
4. **Rate Limiting** (15 dakikada max 10 istek)
5. **IP Tracking & Logging**
6. **Session Timeout** (2 saat)
7. **Environment Variables** (hardcoded şifre yok)

---

## 📋 Kurulum Adımları

### 1️⃣ Güçlü Şifreler Oluşturun

**Admin Şifresi:**
```bash
# Örnek güçlü şifre: En az 20 karakter, büyük-küçük harf, rakam, özel karakter
MangeXis@2025!SuperSecure#AdminP@ssw0rd$
```

**Fansub Şifresi:**
```bash
FansubMangeXis$2025!SecureAccess#P@ss123
```

### 2️⃣ Bcrypt Hash Oluşturun

```bash
cd netlify/functions
node generate-password-hash.js "MangeXis@2025!SuperSecure#AdminP@ssw0rd$"
```

Çıktıyı kopyalayın:
```
$2a$12$ZxY8H2QpL5K9VwN3MrTgUeF7BcDaEfGhIjKlMnOpQrStUvWxYz...
```

Fansub için de tekrarlayın:
```bash
node generate-password-hash.js "FansubMangeXis$2025!SecureAccess#P@ss123"
```

### 3️⃣ JWT Secret Oluşturun

**Option A - OpenSSL:**
```bash
openssl rand -base64 64
```

**Option B - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Çıktı örneği:
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3rS5tU7vW9xY1z...
```

### 4️⃣ Netlify Environment Variables Ayarlayın

**Netlify Dashboard'a git:**
1. Site Settings → Environment Variables
2. Aşağıdaki değişkenleri ekle:

```bash
# JWT Secret (64+ karakter)
JWT_SECRET=<yukarıda oluşturduğunuz değer>

# Admin Hesabı
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<admin için oluşturduğunuz bcrypt hash>

# Fansub Hesabı
FANSUB_USERNAME=fansub
FANSUB_PASSWORD_HASH=<fansub için oluşturduğunuz bcrypt hash>

# GitHub Token (zaten mevcut)
GITHUB_TOKEN=<mevcut token>
REPO_OWNER=Enmxy
REPO_NAME=Mangexis
```

### 5️⃣ Deploy Edin

```bash
git add .
git commit -m "Security: Implement bcrypt hashing and environment variables"
git push
```

Netlify otomatik deploy edecek.

---

## 🔐 Şifre Değiştirme

### Admin Şifresini Değiştirmek:

1. Yeni güçlü şifre oluştur (min 20 karakter)
2. Hash oluştur:
   ```bash
   node netlify/functions/generate-password-hash.js "YeniŞifre123!@#"
   ```
3. Netlify Dashboard → Environment Variables
4. `ADMIN_PASSWORD_HASH` değerini güncelle
5. Site'yi redeploy et

### Fansub Şifresini Değiştirmek:

Aynı adımları `FANSUB_PASSWORD_HASH` için tekrarla.

---

## 🚨 Güvenlik İhlali Durumunda

### Acil Durum Protokolü:

1. **Hemen şifreleri değiştir** (yukarıdaki adımları izle)
2. **JWT_SECRET'ı değiştir** (tüm oturumlar sonlanır)
3. **GitHub Token'ı yenile** (eski token'ı iptal et)
4. **Netlify logs'ları incele:** Site Settings → Functions → Logs
5. **Güvenlik log'larını kontrol et:**
   - Şüpheli IP'leri tespit et
   - Başarısız login denemelerini incele
   - Anormal aktiviteleri raporla

---

## 📊 Güvenlik Metrikleri

### İzlenmesi Gerekenler:

- ✅ **Başarısız login denemeleri** (max 5 per IP)
- ✅ **Lockout durumları** (30 dakika)
- ✅ **Rate limit aşımları** (15 dk / 10 istek)
- ✅ **Token expiration** (2 saat)
- ✅ **Şüpheli IP'ler**

### Netlify Logs:

```bash
# Netlify CLI ile logları izle
netlify functions:log admin-auth
```

---

## 🛠️ Test Etme

### Login Testi:

1. Yanlış şifre ile 3 kez dene → Uyarı mesajı
2. Yanlış şifre ile 5 kez dene → 30 dk kilit
3. Doğru şifre ile giriş → Başarılı
4. Token ile sayfa yenileme → Oturum devam ediyor
5. 2 saat sonra → Token expired, tekrar giriş gerekli

### Brute Force Testi:

```bash
# 10 başarısız deneme simüle et (rate limit devreye girer)
for i in {1..10}; do
  curl -X POST https://mangexis.netlify.app/.netlify/functions/admin-auth \
    -H "Content-Type: application/json" \
    -d '{"action":"login","username":"admin","password":"wrong"}'
done
```

Sonuç: Rate limit hatası veya lockout mesajı.

---

## 📝 Güvenlik Checklist

Kurulumdan önce kontrol edin:

- [ ] JWT_SECRET 64+ karakter, rastgele
- [ ] Admin şifresi 20+ karakter, karmaşık
- [ ] Fansub şifresi 20+ karakter, karmaşık
- [ ] Tüm hashler bcrypt ile oluşturuldu
- [ ] Environment variables Netlify'da ayarlandı
- [ ] .env dosyası .gitignore'da (commit edilmedi)
- [ ] GitHub token yetkileri minimum (sadece gerekli repo)
- [ ] Test login çalışıyor
- [ ] Brute force koruması aktif

---

## 🎯 En İyi Pratikler

### Şifre Güvenliği:
- ✅ Minimum 20 karakter
- ✅ Büyük ve küçük harf karışımı
- ✅ Rakamlar ve özel karakterler
- ✅ Sözlük kelimelerinden kaçının
- ✅ Kişisel bilgiler kullanmayın
- ✅ Her 3 ayda bir değiştirin

### Token Güvenliği:
- ✅ JWT_SECRET'ı asla paylaşmayın
- ✅ Token'ları güvenli saklanır (httpOnly cookies ideal)
- ✅ Session timeout kısa tutun (2 saat)
- ✅ Şüpheli aktivitede token'ı iptal edin

### Environment Variables:
- ✅ Asla Git'e commit etmeyin
- ✅ Sadece Netlify Dashboard'da saklayın
- ✅ Local development için .env.local kullanın
- ✅ Production ve development için farklı değerler

---

## 📞 Destek

Güvenlik sorunları için:
- GitHub Issues: Private security issue aç
- Email: security@mangexis.com (eğer varsa)

**HİÇBİR ZAMAN** şifreleri veya secret'ları public olarak paylaşmayın!

---

## 🔄 Güncellemeler

- **v1.0** (2025-01-30): İlk güvenlik sistemi
  - Bcrypt hashing
  - Environment variables
  - Brute force protection
  - Rate limiting
  - IP tracking

---

**⚠️ SON UYARI:** Bu dokümandaki adımları atlamayın. Güvenlik sizin sorumluluğunuzdadır!
