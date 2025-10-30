import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllMangas } from '../../utils/mangaService'

const ChapterAdd = () => {
  const navigate = useNavigate()
  const [mangas, setMangas] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mangaSlug: '',
    chapterNumber: '',
    chapterTitle: '',
    fansubName: '',
    images: ''
  })

  useEffect(() => {
    loadMangas()
  }, [])

  const loadMangas = async () => {
    try {
      const data = await getAllMangas()
      setMangas(data)
    } catch (error) {
      console.error('Error loading mangas:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.mangaSlug || !formData.chapterNumber || !formData.fansubName || !formData.images) {
      alert('⚠️ Lütfen tüm zorunlu alanları doldurun!')
      return
    }

    setLoading(true)

    try {
      // Parse images (comma or newline separated URLs)
      const imageLinks = formData.images
        .split(/[,\n]/)
        .map(url => url.trim())
        .filter(url => url.length > 0)

      if (imageLinks.length === 0) {
        alert('⚠️ En az 1 resim URL\'si gerekli!')
        setLoading(false)
        return
      }

      const chapterData = {
        id: formData.chapterNumber,
        title: formData.chapterTitle || `Bölüm ${formData.chapterNumber}`,
        imageLinks,
        fansubs: [
          {
            name: formData.fansubName,
            images: imageLinks
          }
        ]
      }

      // Call API to add chapter
      const response = await fetch(`/.netlify/functions/manga-operations?action=addChapter&slug=${formData.mangaSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapterData)
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Bölüm başarıyla eklendi!')
        setFormData({
          mangaSlug: formData.mangaSlug,
          chapterNumber: '',
          chapterTitle: '',
          fansubName: formData.fansubName,
          images: ''
        })
      } else {
        alert('❌ Hata: ' + (result.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('❌ Bir hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Yeni Bölüm Ekle</h1>
        <p className="text-gray-400 text-sm mt-1">Manga'ya yeni bölüm ekleyin</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manga Selection */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-white font-medium mb-3">
            Manga Seçin <span className="text-red-500">*</span>
          </label>
          <select
            name="mangaSlug"
            value={formData.mangaSlug}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            required
          >
            <option value="">Bir manga seçin...</option>
            {mangas.map(manga => (
              <option key={manga.slug} value={manga.slug}>
                {manga.title}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Number */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-white font-medium mb-3">
            Bölüm Numarası <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="chapterNumber"
            value={formData.chapterNumber}
            onChange={handleChange}
            placeholder="Örn: 1, 2, 3..."
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
            required
          />
        </div>

        {/* Chapter Title */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-white font-medium mb-3">
            Bölüm Başlığı (Opsiyonel)
          </label>
          <input
            type="text"
            name="chapterTitle"
            value={formData.chapterTitle}
            onChange={handleChange}
            placeholder="Örn: Başlangıç, Yeni Macera..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Fansub Name */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-white font-medium mb-3">
            Fansub Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fansubName"
            value={formData.fansubName}
            onChange={handleChange}
            placeholder="Örn: MangeXis Fansub"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
            required
          />
        </div>

        {/* Images */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-white font-medium mb-3">
            Resim URL'leri <span className="text-red-500">*</span>
          </label>
          <textarea
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="Her satıra bir resim URL'si yazın veya virgülle ayırın&#10;https://example.com/page1.jpg&#10;https://example.com/page2.jpg&#10;https://example.com/page3.jpg"
            rows={10}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors resize-none font-mono text-sm"
            required
          />
          <p className="text-gray-500 text-xs mt-2">
            Her satıra bir URL yazın veya virgülle ayırın. Sayfa sırasına göre ekleyin.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ekleniyor...' : '✅ Bölüm Ekle'}
          </motion.button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">💡 İpuçları:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Resim URL'lerinin doğru ve erişilebilir olduğundan emin olun</li>
              <li>Sayfaları doğru sırada ekleyin (1, 2, 3...)</li>
              <li>Yüksek kaliteli resimler kullanın</li>
              <li>Bölüm numarası benzersiz olmalıdır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChapterAdd
