# Giscus Category ID Alma

## Repo ID (✅ Eklendi)
```
R_kgDOQM0tVA
```

## Category ID Nasıl Alınır

### Yöntem 1: Giscus.app
1. https://giscus.app/tr
2. Repository: `Enmxy/mangexis-vercel`
3. **Discussion Kategorisi** seçin (örn: "General", "Announcements")
4. Sayfanın altında oluşturulan script'te `data-category-id` değerini kopyalayın

### Yöntem 2: GitHub API
```bash
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/Enmxy/mangexis-vercel/discussions/categories
```

## Şu an kullanılan (varsayılan)
```jsx
data-category-id="DIC_kwDOQM0tVM4Cloqd"
```

⚠️ Eğer yorumlar çalışmazsa:
1. GitHub Discussions aktif olmalı
2. Doğru category seçilmeli
3. Category ID güncellenmeliSpecifically
