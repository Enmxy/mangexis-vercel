# Google'da Site Başlığını "Vercel" Yerine "MangeXis" Yapmak

## Problem
Google'da site arandığında başlıkta "Vercel" görünüyor, "MangeXis" görünmeli.

## Çözüm: Vercel Dashboard'da Değiştirin

1. **Vercel Dashboard'a Giriş Yapın**: https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** > **General** bölümüne gidin
4. **Project Name** kısmını bulun
5. Proje adını `mangexis` veya `mangexis-manga-platform` olarak değiştirin
6. **Save** butonuna tıklayın

## Alternatif: Custom Domain Ekleyin (En İyi Çözüm)

Custom domain eklerseniz Google otomatik olarak domain'i kullanır:

1. Vercel Dashboard > Projeniz > **Settings** > **Domains**
2. Yeni domain ekleyin (örn: `mangexis.com` veya `mangexis.netlify.app`)
3. DNS kayıtlarını Vercel'in verdiği gibi ayarlayın
4. Domain aktif olunca Google otomatik olarak domain'i gösterir

## Google Sitelinks İçin

Eklenen Schema.org structured data ve genişletilmiş sitemap sayesinde Google, sitenizin altında şu linkleri gösterebilir:

- Ana Sayfa
- Manga Keşfet
- Favoriler
- Haberler
- Hakkımızda
- Sorumluluk Reddi

**Not**: Google'ın sitelinks göstermesi 1-2 hafta sürebilir. Site trafiği arttıkça daha hızlı görünür.

## Hızlandırmak İçin:

1. **Google Search Console'a site ekleyin**: https://search.google.com/search-console
2. Sitemap'i submit edin: `https://mangexis.netlify.app/sitemap.xml`
3. URL Inspection tool ile ana sayfayı test edin
4. "Request Indexing" yapın

**İpucu**: Sosyal medyada paylaşım yapmak, site trafiğini artırır ve Google'ın daha hızlı indexlemesini sağlar!
