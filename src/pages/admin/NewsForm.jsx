import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { saveNews, updateNews, getAllNews } from '../../utils/newsService'
import { uploadImage } from '../../utils/mangaService'

const NewsForm = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = !!slug

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    tags: []
  })

  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadNewsForEdit()
    }
  }, [isEdit, slug])

  const loadNewsForEdit = async () => {
    try {
      const allNews = await getAllNews()
      const news = allNews.find(n => n.slug === slug)
      
      if (news) {
        setFormData(news)
      }
    } catch (error) {
      console.error('Error loading news:', error)
      alert('❌ Haber yüklenemedi: ' + error.message)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadProgress('Yükleniyor...')

    try {
      const url = await uploadImage(file)
      setFormData({ ...formData, image: url })
      setUploadProgress('Görsel yüklendi!')
      setTimeout(() => setUploadProgress(''), 2000)
    } catch (error) {
      alert('Yükleme hatası: ' + error.message)
      setUploadProgress('')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.slug || !formData.content) {
      alert('⚠️ Lütfen tüm zorunlu alanları doldurun (Başlık, İçerik)')
      return
    }
    
    setSaving(true)
    setUploadProgress('Kaydediliyor...')

    try {
      const newsData = {
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0]
      }

      if (isEdit) {
        await updateNews(slug, newsData)
        alert(`✅ Haber güncellendi!\n\n${newsData.title}`)
      } else {
        await saveNews(newsData)
        alert(`✅ Haber eklendi!\n\n${newsData.title}`)
      }
      navigate('/admin/news')
    } catch (error) {
      console.error('Save error:', error)
      alert(`❌ Kaydetme hatası:\n\n${error.message}`)
    } finally {
      setSaving(false)
      setUploadProgress('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEdit ? 'Haber Düzenle' : 'Yeni Haber Ekle'}
          </h1>
          <p className="text-gray-400">Manga haberi {isEdit ? 'düzenle' : 'oluştur'}</p>
        </div>
      </div>

      {uploadProgress && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-400 text-sm">{uploadProgress}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Temel Bilgiler</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Örn: Solo Leveling'in Yeni Sezonu Geliyor!"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="solo-leveling-yeni-sezon"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tarih
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Özet (Kısa Açıklama)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Haberin kısa özeti (1-2 cümle)"
              />
            </div>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Kapak Görseli</h2>
          
          {formData.image && (
            <div className="mb-4">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full max-w-md h-64 object-cover rounded-lg"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image' }}
              />
            </div>
          )}

          <div className="flex gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
            />
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="veya URL girin"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">İçerik *</h2>
          
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={15}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
            placeholder="Haber içeriği... (Markdown destekler)"
            required
          />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Etiketler</h2>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-300 hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Etiket ekle (örn: anime, manga, duyuru)"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ekle
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            disabled={saving}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Haberi Yayınla')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewsForm
