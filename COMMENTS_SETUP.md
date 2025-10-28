# MangeXis Yorum Sistemi - Giscus Kurulumu

Giscus, GitHub Discussions kullanarak ücretsiz ve güçlü bir yorum sistemi sağlar.

## 🚀 Kurulum Adımları

### 1. GitHub Discussions'ı Aktifleştir

1. GitHub repository'nize gidin: `https://github.com/Enmxy/Mangexis`
2. **Settings** tab'ına tıklayın
3. **Features** bölümünde **Discussions** checkbox'ını işaretleyin
4. **Set up discussions** butonuna tıklayın

### 2. Giscus App'i Yükle

1. [giscus.app](https://giscus.app) adresine gidin
2. **Configuration** bölümüne inin
3. Repository kısmına: `Enmxy/Mangexis` yazın
4. Sayfa aşağı kaydırın

### 3. Giscus'u Repository'ye Bağla

1. [GitHub Apps - giscus](https://github.com/apps/giscus) linkine gidin
2. **Install** butonuna tıklayın
3. **Only select repositories** seçin
4. `Mangexis` repository'sini seçin
5. **Install** butonuna tıklayın

### 4. Discussions Category Oluştur

1. Repository → **Discussions** tab
2. **New discussion** → Category dropdown
3. **⚙️ Manage categories** tıklayın
4. **New category** butonuna tıklayın
5. Category bilgileri:
   - **Name:** `Comments`
   - **Description:** `Manga yorumları`
   - **Format:** Announcement (sadece maintainer'lar thread açabilir)
6. **Create** butonuna tıklayın

### 5. Giscus Config Değerlerini Al

1. [giscus.app](https://giscus.app) sayfasına dön
2. **Repository:** `Enmxy/Mangexis` yazın
3. **Page ↔️ Discussions Mapping:** `specific term` seçin
4. **Discussion Category:** `Comments` seçin
5. **Features:**
   - ✅ Enable reactions
   - ✅ Emit discussion metadata
6. **Theme:** `dark` seçin
7. **Language:** `tr` (Türkçe) seçin

### 6. Config Değerlerini Kopyala

Sayfanın altında oluşan script'ten bu değerleri kopyalayın:

```javascript
data-repo-id="R_xxxxxxxxxxxxx"
data-category-id="DIC_xxxxxxxxxxxxx"
```

### 7. Comments.jsx Dosyasını Güncelle

`src/components/Comments.jsx` dosyasını açın ve şu satırları güncelleyin:

```javascript
script.setAttribute('data-repo-id', 'R_xxxxxxxxxxxxx') // Kopyaladığınız değer
script.setAttribute('data-category-id', 'DIC_xxxxxxxxxxxxx') // Kopyaladığınız değer
```

### 8. GitHub'a Push Et

```bash
git add .
git commit -m "Add Giscus comment system"
git push
```

### 9. Netlify'de Deploy

Netlify otomatik deploy edecek. Deploy tamamlandıktan sonra yorumlar çalışacak!

---

## ✅ Yorum Sistemi Özellikleri

### **Manga Detay Sayfası**
- Her manga için ayrı yorum bölümü
- Identifier: `manga-{slug}`
- Örnek: `manga-one-piece`

### **Reader Sayfası**
- Her bölüm için ayrı yorumlar
- Son sayfada görünür
- Identifier: `chapter-{slug}-{chapterId}`
- Örnek: `chapter-one-piece-1`

### **Kullanıcı Özellikleri**
- GitHub hesabı ile giriş
- Markdown desteği
- Reactions (👍 ❤️ 🎉 🚀)
- Reply (yanıtlama)
- Edit/Delete (kendi yorumları)
- Spam koruması

---

## 🎨 Görünüm

Yorumlar MangeXis'in dark temasına uygun:
- Siyah arka plan
- Beyaz text
- Purple accent'ler
- Smooth animasyonlar

---

## 🔧 Sorun Giderme

### Yorumlar görünmüyor
- GitHub Discussions aktif mi kontrol edin
- Giscus app yüklü mü kontrol edin
- `data-repo-id` ve `data-category-id` doğru mu kontrol edin

### "Discussion not found" hatası
- Repository public olmalı
- Discussions aktif olmalı
- Category "Comments" olarak oluşturulmalı

### Yorumlar yüklenmiyor
- Browser console'da (F12) hata var mı kontrol edin
- Repository adı doğru mu: `Enmxy/Mangexis`

---

## 💡 Alternatif Yorum Sistemleri

Giscus yerine başka sistemler de kullanabilirsiniz:

### **1. Disqus** (Popüler)
- ✅ Kolay kurulum
- ❌ Reklam var (ücretsiz plan)
- ❌ Yavaş yükleme

### **2. Utterances** (GitHub Issues)
- ✅ Ücretsiz
- ✅ Hafif
- ❌ Issues karışır

### **3. Commento** (Self-hosted)
- ✅ Reklamsız
- ✅ Hızlı
- ❌ Hosting gerekli

### **4. Facebook Comments**
- ✅ Kolay
- ❌ Facebook hesabı gerekli
- ❌ Privacy concerns

**Giscus en iyi seçenek** çünkü:
- Tamamen ücretsiz
- Reklamsız
- GitHub entegrasyonu
- Spam koruması
- Modern ve hızlı

---

## 📊 Yorum İstatistikleri

GitHub Discussions'dan yorum istatistiklerini görebilirsiniz:
- Toplam yorum sayısı
- En çok yorumlanan mangalar
- En aktif kullanıcılar
- Reaction istatistikleri

---

**MangeXis Yorum Sistemi** - GitHub Discussions ile güçlendirildi! 💬
