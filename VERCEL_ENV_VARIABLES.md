# 🔐 Vercel Environment Variables (Ortam Değişkenleri)

Bu dosya, MangeXis projesinin Vercel'de çalışması için gerekli tüm environment variables'ları açıklar.

## 📋 Gerekli Environment Variables

### 1. JWT_SECRET (ZORUNLU)
**Açıklama:** JSON Web Token şifreleme için kullanılan gizli anahtar  
**Tip:** String (64+ karakter önerilir)  
**Örnek Değer:** `your_super_secret_random_64_character_jwt_key_here_abc123xyz789`

**Nasıl oluşturulur:**
```bash
# Linux/Mac Terminal:
openssl rand -base64 64

# Windows PowerShell:
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js Console:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Vercel'de ayarlama:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Key: `JWT_SECRET`
3. Value: Yukarıdaki komutlardan birinin çıktısını yapıştırın
4. Environment: Production, Preview, Development (hepsini seçin)
5. Save

---

### 2. ADMIN_USERNAME (ZORUNLU)
**Açıklama:** Admin kullanıcı adı  
**Tip:** String  
**Varsayılan Değer:** `admin`  
**Önerilen Değer:** `admin` veya özel bir kullanıcı adı

**Vercel'de ayarlama:**
- Key: `ADMIN_USERNAME`
- Value: `admin` (veya tercih ettiğiniz kullanıcı adı)
- Environment: Production, Preview, Development

---

### 3. ADMIN_PASSWORD_HASH (ZORUNLU)
**Açıklama:** Admin şifresinin bcrypt hash'i  
**Tip:** String (bcrypt hash)  
**Örnek:** `$2a$12$AEBfqB557jswA/1v70Y2I.bqdRaRvEolU4.ZdOcItffHXG.b.0Uwu`

**Nasıl oluşturulur:**
```bash
# 1. Proje klasörüne gidin
cd netlify/functions

# 2. Hash oluşturucu scripti çalıştırın
node generate-password-hash.cjs YourStrongPassword123!

# 3. Çıktıdaki hash'i kopyalayın
```

**Güçlü şifre önerileri:**
- En az 12 karakter
- Büyük ve küçük harf
- Rakamlar
- Özel karakterler (!@#$%^&*)

**Vercel'de ayarlama:**
- Key: `ADMIN_PASSWORD_HASH`
- Value: Oluşturduğunuz bcrypt hash
- Environment: Production, Preview, Development

---

### 4. FANSUB_USERNAME (ZORUNLU)
**Açıklama:** Fansub kullanıcı adı (sadece bölüm yükleme yetkisi)  
**Tip:** String  
**Varsayılan Değer:** `fansub`  
**Önerilen Değer:** `fansub` veya ekibinizin adı

**Vercel'de ayarlama:**
- Key: `FANSUB_USERNAME`
- Value: `fansub`
- Environment: Production, Preview, Development

---

### 5. FANSUB_PASSWORD_HASH (ZORUNLU)
**Açıklama:** Fansub kullanıcı şifresinin bcrypt hash'i  
**Tip:** String (bcrypt hash)  

**Nasıl oluşturulur:**
```bash
cd netlify/functions
node generate-password-hash.cjs YourFansubPassword456!
```

**Vercel'de ayarlama:**
- Key: `FANSUB_PASSWORD_HASH`
- Value: Oluşturduğunuz bcrypt hash
- Environment: Production, Preview, Development

---

### 6. GITHUB_TOKEN (ZORUNLU)
**Açıklama:** GitHub Personal Access Token (veri depolama için)  
**Tip:** String (GitHub token)  
**Format:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Nasıl oluşturulur:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" butonuna tıklayın
3. Token adı: `mangexis-vercel`
4. Expiration: No expiration (veya 1 year)
5. Yetkileri seçin:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. "Generate token" butonuna tıklayın
7. Token'ı kopyalayın (⚠️ Bir daha göremezsiniz!)

**Vercel'de ayarlama:**
- Key: `GITHUB_TOKEN`
- Value: `ghp_xxxxxxxxxxxxxxxxxxxx`
- Environment: Production, Preview, Development

---

### 7. REPO_OWNER (ZORUNLU)
**Açıklama:** GitHub repository sahibinin kullanıcı adı  
**Tip:** String  
**Varsayılan Değer:** `Enmxy`  
**Değer:** GitHub kullanıcı adınız

**Vercel'de ayarlama:**
- Key: `REPO_OWNER`
- Value: `Enmxy` (kendi kullanıcı adınız)
- Environment: Production, Preview, Development

---

### 8. REPO_NAME (ZORUNLU)
**Açıklama:** GitHub repository adı  
**Tip:** String  
**Varsayılan Değer:** `Mangexis`  
**Değer:** Repository adınız

**Vercel'de ayarlama:**
- Key: `REPO_NAME`
- Value: `Mangexis` (kendi repo adınız)
- Environment: Production, Preview, Development

---

### 9. IMGBB_API_KEY (OPSİYONEL)
**Açıklama:** ImgBB resim hosting API anahtarı  
**Tip:** String  
**Gerekli mi?** Hayır (resim yükleme özelliğini kullanmayacaksanız)

**Nasıl alınır:**
1. [ImgBB API](https://api.imgbb.com/) sitesine gidin
2. "Get API Key" butonuna tıklayın
3. Ücretsiz hesap oluşturun
4. API key'inizi kopyalayın

**Vercel'de ayarlama:**
- Key: `IMGBB_API_KEY`
- Value: `xxxxxxxxxxxxxxxxxxxxxxx`
- Environment: Production, Preview, Development

---

## 🎯 Hızlı Kurulum Checklist

Vercel'de aşağıdaki değişkenleri sırayla ekleyin:

- [ ] `JWT_SECRET` - 64 karakterlik random string
- [ ] `ADMIN_USERNAME` - `admin`
- [ ] `ADMIN_PASSWORD_HASH` - bcrypt hash (script ile oluşturun)
- [ ] `FANSUB_USERNAME` - `fansub`
- [ ] `FANSUB_PASSWORD_HASH` - bcrypt hash (script ile oluşturun)
- [ ] `GITHUB_TOKEN` - GitHub Personal Access Token
- [ ] `REPO_OWNER` - GitHub kullanıcı adınız
- [ ] `REPO_NAME` - Repository adınız
- [ ] `IMGBB_API_KEY` - (Opsiyonel) ImgBB API key

## 🔄 Vercel'de Toplu Ekleme

Vercel CLI ile toplu ekleme yapabilirsiniz:

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Login
vercel login

# Değişkenleri ekleyin
vercel env add JWT_SECRET production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD_HASH production
vercel env add FANSUB_USERNAME production
vercel env add FANSUB_PASSWORD_HASH production
vercel env add GITHUB_TOKEN production
vercel env add REPO_OWNER production
vercel env add REPO_NAME production
```

## ⚠️ Güvenlik Uyarıları

1. **GİZLİ TUTUN:** Environment variables'ları asla GitHub'a pushlamamayın
2. **PAYLAŞMAYIN:** JWT_SECRET ve GitHub token'ları kimseyle paylaşmayın
3. **YENİLEYİN:** Güvenlik riski olduğunda hemen yenileyin
4. **YEDEK ALIN:** Tüm değerleri güvenli bir yerde (şifre yöneticisi) saklayın
5. **.env KULLANMAYIN:** Vercel'in kendi environment variables sistemini kullanın

## 🔍 Test Etme

Tüm değişkenleri ekledikten sonra:

1. Vercel'de yeniden deploy edin
2. Build loglarını kontrol edin
3. Admin panel'e giriş yapın
4. API endpoint'lerini test edin

## 🆘 Sorun Giderme

### "JWT_SECRET not set" Hatası
- Vercel Environment Variables'a `JWT_SECRET` eklenmiş mi?
- Deployment sonrası redeploy yapıldı mı?

### "Invalid credentials" Hatası
- `ADMIN_PASSWORD_HASH` doğru oluşturulmuş mu?
- Şifreyi hash'lerken doğru komutu kullandınız mı?

### GitHub API Hatası
- `GITHUB_TOKEN` geçerli mi?
- Token'ın `repo` yetkisi var mı?
- `REPO_OWNER` ve `REPO_NAME` doğru mu?

---

**Başarılar! 🎉**
