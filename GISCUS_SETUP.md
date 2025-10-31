# 🗨️ Giscus Yorum Sistemi Kurulumu

## 1. GitHub Discussions'ı Aktifleştirin

1. https://github.com/Enmxy/mangexis-vercel/settings
2. **Features** bölümünde **Discussions** seçeneğini aktifleştirin

## 2. Giscus App'i Kurun

1. https://github.com/apps/giscus
2. **Install** butonuna tıklayın
3. `mangexis-vercel` repository'sini seçin

## 3. Repo ID ve Category ID Alın

1. https://giscus.app/tr
2. Repository: `Enmxy/mangexis-vercel` yazın
3. **repo-id** ve **category-id** değerlerini kopyalayın

## 4. Giscus Component'ini Güncelleyin

`src/components/Giscus.jsx` dosyasında:

```jsx
script.setAttribute('data-repo-id', 'YOUR_REPO_ID') // Buraya yapıştır
script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID') // Buraya yapıştır
```

## 5. Push Edin

```bash
git add src/components/Giscus.jsx
git commit -m "feat: Giscus repo ID ve category ID güncellendi"
git push
```

Deploy bitince yorumlar çalışacak!

## ✅ Kullanım

- **Manga Detail:** Her manga için ayrı yorum bölümü
- **News Detail:** Her haber için ayrı yorum bölümü
- **Dark Theme:** Otomatik dark tema
- **Türkçe:** Arayüz Türkçe
