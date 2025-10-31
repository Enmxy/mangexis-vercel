# Giscus Category Seçimi

## Önerilen Category Yapısı

GitHub Discussions'da şu kategorileri oluşturun:

### 1. **General** (Genel) ✅ Önerilen
- Tüm yorumlar için kullanılabilir
- En basit ve esnek seçenek
- Format: Discussion

### 2. **Announcements** (Duyurular)
- Sadece admin yorum yapabilir
- Önemli site duyuruları için
- Format: Announcement

### 3. **Manga Yorumları** (İsteğe bağlı)
- Sadece manga yorumları için
- Format: Discussion

### 4. **Haberler** (İsteğe bağlı)
- Sadece haber yorumları için
- Format: Discussion

## 🎯 Basit Çözüm (Önerilen)

**Tek category kullanın: "General"**

✅ Avantajları:
- Tüm yorumlar tek yerde
- Kolay yönetim
- Giscus otomatik ayırım yapar (term ile)

## GitHub Discussions Aktifleştirme

1. https://github.com/Enmxy/mangexis-vercel/settings
2. **Features** → ✅ **Discussions** seçin
3. Otomatik **General** category oluşur
4. İsterseniz yeni category ekleyin: **New category**

## Category ID Alma

1. https://giscus.app/tr
2. Repository: `Enmxy/mangexis-vercel`
3. **Category** dropdown'dan "General" seçin
4. Sayfanın altında gösterilen `data-category-id`'yi kopyalayın
5. `src/components/Giscus.jsx` dosyasında güncelleyin

## Şu An Kullanılan

```jsx
data-category: "General"
data-category-id: "DIC_kwDOQM0tVM4Cloqd" // Sizin repo'nuza göre değişecek
```

⚠️ **Önemli:** Category ID'yi giscus.app'den almanız gerekiyor!
