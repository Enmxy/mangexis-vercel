import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { saveSlider, updateSlider, getAllSliders } from '../../utils/sliderService'
import { notifyContentUpdate, UPDATE_TYPES } from '../../utils/contentUpdateEvent'

const SliderForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    type: 'manga',
    link: '',
    buttonText: 'Oku'
  })
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadSlider()
    }
  }, [id])

  const loadSlider = async () => {
    try {
      const sliders = await getAllSliders()
      const slider = sliders.find(s => s.id === parseInt(id))
      if (slider) {
        setFormData(slider)
      }
    } catch (error) {
      alert('Slider yüklenirken hata oluştu')
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
    
    // Validation
    if (!formData.title || !formData.image || !formData.type) {
      alert('⚠️ Lütfen zorunlu alanları doldurun!')
      return
    }

    setLoading(true)

    try {
      if (isEdit) {
        const result = await updateSlider(formData)
        if (result.success) {
          notifyContentUpdate(UPDATE_TYPES.CONTENT_UPDATED, { type: 'slider_updated' })
          alert('✅ Slider başarıyla güncellendi!')
          navigate('/admin/sliders')
        } else {
          alert('❌ Hata: ' + (result.errors ? result.errors.join(', ') : result.error))
        }
      } else {
        const result = await saveSlider(formData)
        if (result.success) {
          notifyContentUpdate(UPDATE_TYPES.SLIDER_ADDED, { title: formData.title })
          alert('✅ Slider başarıyla eklendi!')
          navigate('/admin/sliders')
        } else {
          alert('❌ Hata: ' + (result.errors ? result.errors.join(', ') : result.error))
        }
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
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Ana sayfada gösterilecek slider oluşturun
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Type */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <label className="block text-white font-medium mb-3">
                Slider Türü <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'manga' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'manga'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-white text-sm font-medium">Manga</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'news' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'news'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">📰</div>
                  <div className="text-white text-sm font-medium">Haber</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'announcement' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'announcement'
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">📢</div>
                  <div className="text-white text-sm font-medium">Duyuru</div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <label className="block text-white font-medium mb-3">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Örn: One Piece - Yeni Bölüm Yayında!"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <label className="block text-white font-medium mb-3">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Slider açıklaması (opsiyonel)"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Image URL */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <label className="block text-white font-medium mb-3">
                Resim URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <p className="text-gray-500 text-xs mt-2">16:9 aspect ratio önerilir (1920x1080)</p>
            </div>

            {/* Link */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <label className="block text-white font-medium mb-3">
                Link
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="/manga/one-piece veya https://..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Button Text */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <label className="block text-white font-medium mb-3">
                Buton Metni
              </label>
              <input
                type="text"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                placeholder="Oku, İncele, Detaylar vb."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Preview</h3>
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  {preview ? 'Gizle' : 'Göster'}
                </button>
              </div>

              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-xl overflow-hidden"
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={formData.title || 'Preview'}
                      className="w-full aspect-video object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500">Resim yok</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {formData.title || 'Başlık'}
                    </h2>
                    {formData.description && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {formData.description}
                      </p>
                    )}
                    {formData.buttonText && (
                      <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">
                        {formData.buttonText}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {!preview && (
                <div className="text-center py-12 text-gray-500">
                  Preview'i görmek için "Göster" butonuna tıklayın
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate('/admin/sliders')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            İptal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : isEdit ? '💾 Güncelle' : '✨ Oluştur'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export default SliderForm
