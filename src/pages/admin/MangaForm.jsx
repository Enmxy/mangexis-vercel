import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mangaList } from '../../data/mangaData'
import { saveManga, updateManga, uploadImage } from '../../utils/mangaService'

const MangaForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEdit = !!slug

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    cover: '',
    description: '',
    status: 'ongoing',
    genres: [],
    fansub: '',
    chapters: []
  })

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [saving, setSaving] = useState(false)

  const [newGenre, setNewGenre] = useState('')
  const [newChapter, setNewChapter] = useState({
    chapter: 1,
    images: [''],
    fansubs: [{ name: 'Default', images: [''] }]
  })

  const availableGenres = [
    'Aksiyon', 'Macera', 'Shounen', 'Fantastik', 'Drama', 
    'Gerilim', 'Doğaüstü', 'Karanlık Fantazi', 'Komedi',
    'Romantizm', 'Seinen', 'Korku', 'Psikolojik', 'Manhwa',
    'Süper Güç', 'Okul'
  ]

  useEffect(() => {
    if (isEdit) {
      const manga = mangaList.find(m => m.slug === slug)
      if (manga) {
        setFormData({
          title: manga.title,
          slug: manga.slug,
          cover: manga.cover,
          description: manga.description,
          status: manga.status,
          genres: manga.genres || [],
          fansub: manga.fansub || '',
          chapters: manga.chapters?.map(ch => ({
            chapter: parseInt(ch.id),
            images: ch.imageLinks || [],
            fansubs: ch.fansubs || [{ name: 'Default', images: ch.imageLinks || [] }]
          })) || []
        })
      }
    }
  }, [isEdit, slug])

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

  const handleAddGenre = (genre) => {
    if (!formData.genres.includes(genre)) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre]
      })
    }
  }

  const handleRemoveGenre = (genre) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(g => g !== genre)
    })
  }

  const handleAddCustomGenre = () => {
    if (newGenre && !formData.genres.includes(newGenre)) {
      setFormData({
        ...formData,
        genres: [...formData.genres, newGenre]
      })
      setNewGenre('')
    }
  }

  const handleAddImageField = () => {
    setNewChapter({
      ...newChapter,
      images: [...newChapter.images, '']
    })
  }

  const handleRemoveImageField = (index) => {
    setNewChapter({
      ...newChapter,
      images: newChapter.images.filter((_, i) => i !== index)
    })
  }

  const handleImageChange = (index, value) => {
    const updatedImages = [...newChapter.images]
    updatedImages[index] = value
    setNewChapter({
      ...newChapter,
      images: updatedImages
    })
  }

  const handleAddChapter = () => {
    if (newChapter.images.some(img => img.trim())) {
      setFormData({
        ...formData,
        chapters: [...formData.chapters, { ...newChapter }]
      })
      setNewChapter({
        chapter: newChapter.chapter + 1,
        images: [''],
        fansubs: [{ name: 'Default', images: [''] }]
      })
    }
  }

  const handleAddFansub = () => {
    setNewChapter({
      ...newChapter,
      fansubs: [...newChapter.fansubs, { name: '', images: [''] }]
    })
  }

  const handleRemoveFansub = (index) => {
    setNewChapter({
      ...newChapter,
      fansubs: newChapter.fansubs.filter((_, i) => i !== index)
    })
  }

  const handleFansubNameChange = (index, name) => {
    const updatedFansubs = [...newChapter.fansubs]
    updatedFansubs[index].name = name
    setNewChapter({ ...newChapter, fansubs: updatedFansubs })
  }

  const handleFansubImageChange = (fansubIndex, imageIndex, value) => {
    const updatedFansubs = [...newChapter.fansubs]
    updatedFansubs[fansubIndex].images[imageIndex] = value
    setNewChapter({ ...newChapter, fansubs: updatedFansubs })
  }

  const handleAddFansubImage = (fansubIndex) => {
    const updatedFansubs = [...newChapter.fansubs]
    updatedFansubs[fansubIndex].images.push('')
    setNewChapter({ ...newChapter, fansubs: updatedFansubs })
  }

  const handleRemoveFansubImage = (fansubIndex, imageIndex) => {
    const updatedFansubs = [...newChapter.fansubs]
    updatedFansubs[fansubIndex].images = updatedFansubs[fansubIndex].images.filter((_, i) => i !== imageIndex)
    setNewChapter({ ...newChapter, fansubs: updatedFansubs })
  }

  const handleRemoveChapter = (index) => {
    setFormData({
      ...formData,
      chapters: formData.chapters.filter((_, i) => i !== index)
    })
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadProgress('Kapak yükleniyor...')

    try {
      const url = await uploadImage(file)
      setFormData({ ...formData, cover: url })
      setUploadProgress('Kapak yüklendi!')
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
    
    setSaving(true)
    setUploadProgress('Kaydediliyor...')

    try {
      // Convert chapters format for compatibility
      const formattedData = {
        ...formData,
        chapters: formData.chapters.map(ch => ({
          id: ch.chapter.toString(),
          title: `Bölüm ${ch.chapter}`,
          imageLinks: ch.images.filter(img => img.trim()),
          fansubs: ch.fansubs || []
        }))
      }

      if (isEdit) {
        await updateManga(slug, formattedData)
        alert('✅ Manga başarıyla güncellendi!')
      } else {
        await saveManga(formattedData)
        alert('✅ Manga başarıyla eklendi! Manga listesinde görünecek.')
      }
      navigate('/admin/mangas')
    } catch (error) {
      alert('❌ Hata: ' + error.message)
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
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Manga Düzenle' : 'Yeni Manga Ekle'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isEdit ? 'Manga bilgilerini güncelleyin' : 'Yeni manga bilgilerini girin'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/mangas')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕ Kapat
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Temel Bilgiler</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Manga başlığı"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="manga-slug"
              />
              <p className="text-gray-500 text-xs mt-1">Otomatik oluşturuldu, düzenleyebilirsiniz</p>
            </div>

            {/* Cover Upload/URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kapak Resmi *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={formData.cover}
                  onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://... veya dosya yükle"
                />
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                  <span>📁</span>
                  <span className="hidden sm:inline">Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploadProgress && (
                <p className="text-sm text-purple-400 mb-2">{uploadProgress}</p>
              )}
              {formData.cover && (
                <div className="mt-3">
                  <img
                    src={formData.cover}
                    alt="Preview"
                    className="w-32 h-48 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400?text=Invalid+URL'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Açıklama *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Manga açıklaması..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Durum *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
              >
                <option value="ongoing">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="hiatus">Ara Verildi</option>
              </select>
            </div>

            {/* Fansub */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fansub/Çeviri Grubu
              </label>
              <input
                type="text"
                value={formData.fansub}
                onChange={(e) => setFormData({ ...formData, fansub: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Örn: MangeXis Fansub, Türk Anime TV"
              />
              <p className="text-gray-500 text-xs mt-1">Çeviriyi yapan grup/kişi (opsiyonel)</p>
            </div>
          </div>
        </motion.div>

        {/* Genres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Türler</h2>
          
          {/* Selected Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.genres.map((genre) => (
              <motion.span
                key={genre}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg flex items-center gap-2"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => handleRemoveGenre(genre)}
                  className="hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </motion.span>
            ))}
          </div>

          {/* Available Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {availableGenres.filter(g => !formData.genres.includes(g)).map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleAddGenre(genre)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                + {genre}
              </button>
            ))}
          </div>

          {/* Custom Genre */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              placeholder="Özel tür ekle..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddCustomGenre}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ekle
            </button>
          </div>
        </motion.div>

        {/* Chapters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Bölümler</h2>
          
          {/* Existing Chapters */}
          {formData.chapters.length > 0 && (
            <div className="space-y-3 mb-6">
              {formData.chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">Bölüm {chapter.chapter}</p>
                    <p className="text-gray-400 text-sm">{chapter.images.length} sayfa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Chapter */}
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bölüm Numarası
              </label>
              <input
                type="number"
                value={newChapter.chapter}
                onChange={(e) => setNewChapter({ ...newChapter, chapter: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sayfa Linkleri
              </label>
              <div className="space-y-2">
                {newChapter.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={`Sayfa ${index + 1} URL`}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    {newChapter.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(index)}
                        className="text-red-400 hover:text-red-300 px-3 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddImageField}
                className="mt-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                + Sayfa Ekle
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddChapter}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Bölüm Ekle
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/mangas')}
            disabled={saving}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '⏳ Kaydediliyor...' : (isEdit ? '💾 Güncelle' : '✅ Kaydet')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MangaForm
