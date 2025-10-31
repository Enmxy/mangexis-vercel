# 🔧 Git Komutları - Hızlı Referans

## 🆕 Yeni Repository İçin İlk Kurulum

### Adım 1: Git'i Başlat
```bash
git init
```

### Adım 2: Dosyaları Ekle
```bash
# Tüm dosyaları ekle
git add .

# Sadece belirli dosyaları ekle
git add dosya-adi.js
git add klasor-adi/
```

### Adım 3: İlk Commit
```bash
git commit -m "feat: Vercel deployment için proje hazırlandı"
```

### Adım 4: Remote Repository Ekle
```bash
# KULLANICI_ADINIZ ve REPO_ADINIZ değerlerini değiştirin!
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
```

**Örnek:**
```bash
git remote add origin https://github.com/Enmxy/mangexis-vercel.git
```

### Adım 5: Ana Branch'i Ayarla ve Push Et
```bash
# Main branch'i oluştur
git branch -M main

# İlk push
git push -u origin main
```

---

## 🔄 Normal Kullanım (Deploy Sonrası)

### Değişiklikleri Push Etme

```bash
# 1. Değişiklikleri görüntüle
git status

# 2. Dosyaları ekle
git add .

# 3. Commit yap
git commit -m "feat: yeni özellik eklendi"

# 4. Push et
git push
```

**Vercel otomatik olarak deploy edecek!** 🚀

---

## 📝 Commit Mesajı Formatı

Profesyonel commit mesajları için:

```bash
# Yeni özellik
git commit -m "feat: manga filtreleme eklendi"

# Hata düzeltme
git commit -m "fix: login sorunu düzeltildi"

# Dokümantasyon
git commit -m "docs: README güncellendi"

# Stil değişikliği
git commit -m "style: buton renkleri güncellendi"

# Refactor
git commit -m "refactor: API kodları iyileştirildi"

# Test
git commit -m "test: unit testler eklendi"

# Performans
git commit -m "perf: resim yükleme hızlandırıldı"
```

---

## 🌿 Branch Kullanımı

### Yeni Branch Oluşturma
```bash
# Yeni branch oluştur ve geç
git checkout -b feature/yeni-ozellik

# Değişiklikleri yap
# ...

# Commit yap
git add .
git commit -m "feat: yeni özellik"

# Push et
git push -u origin feature/yeni-ozellik
```

### Ana Branch'e Merge
```bash
# Ana branch'e geç
git checkout main

# Değişiklikleri çek
git pull

# Branch'i merge et
git merge feature/yeni-ozellik

# Push et
git push
```

---

## 🔍 Kullanışlı Komutlar

### Durumu Kontrol Etme
```bash
# Değişiklikleri göster
git status

# Commit geçmişini göster
git log

# Kısa log
git log --oneline

# Son 5 commit
git log -5
```

### Değişiklikleri Görüntüleme
```bash
# Staging öncesi değişiklikler
git diff

# Staging sonrası değişiklikler
git diff --staged
```

### Geri Alma
```bash
# Son commit'i geri al (değişiklikler kalır)
git reset --soft HEAD^

# Dosyayı staging'den çıkar
git reset HEAD dosya-adi.js

# Tüm değişiklikleri iptal et (DİKKATLİ!)
git reset --hard HEAD
```

---

## 🔗 Remote İşlemleri

### Remote Kontrol
```bash
# Remote'ları listele
git remote -v

# Remote ekle
git remote add origin URL

# Remote değiştir
git remote set-url origin YENİ_URL

# Remote sil
git remote remove origin
```

### Pull & Fetch
```bash
# Değişiklikleri çek ve merge et
git pull

# Sadece değişiklikleri çek
git fetch

# Belirli branch'i çek
git pull origin main
```

---

## 🚨 Acil Durumlar

### Son Commit Mesajını Değiştir
```bash
git commit --amend -m "yeni commit mesajı"
```

### Dosyayı Git'ten Kaldır (Fiziksel Silmeden)
```bash
git rm --cached dosya-adi.js
git commit -m "chore: gereksiz dosya kaldırıldı"
```

### .gitignore Güncelleme Sonrası
```bash
git rm -r --cached .
git add .
git commit -m "chore: gitignore güncellendi"
```

### Conflict Çözme
```bash
# 1. Dosyaları manuel düzenle (<<<< ==== >>>> işaretleri)
# 2. Düzeltilmiş dosyaları ekle
git add .
# 3. Commit yap
git commit -m "fix: merge conflict çözüldü"
```

---

## 📦 .gitignore

Önemli dosyalar `.gitignore` dosyasında:

```
# Environment variables
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel/

# Netlify
.netlify/
```

---

## 🎯 Hızlı Referans Tablosu

| Komut | Açıklama |
|-------|----------|
| `git status` | Durum kontrolü |
| `git add .` | Tüm dosyaları ekle |
| `git commit -m "msg"` | Commit yap |
| `git push` | GitHub'a gönder |
| `git pull` | GitHub'dan çek |
| `git log` | Geçmişi göster |
| `git diff` | Değişiklikleri göster |
| `git branch` | Branch'leri listele |
| `git checkout -b name` | Yeni branch oluştur |
| `git merge branch` | Branch'i merge et |

---

## 💡 İpuçları

1. **Sık commit yapın:** Küçük, anlamlı commit'ler
2. **Açıklayıcı mesajlar:** Ne yaptığınızı açıklayın
3. **Push öncesi kontrol:** `git status` ve `git diff`
4. **Branch kullanın:** Büyük özellikler için ayrı branch
5. **Pull before push:** Push öncesi son değişiklikleri çekin

---

**İyi kullanımlar! 🚀**
