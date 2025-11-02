import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllMangas } from '../../utils/mangaService'

const ChapterEdit = () => {
  const navigate = useNavigate()
  const { slug, chapterId } = useParams()
  const [manga, setManga] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [fansubs, setFansubs] = useState([])
  const [currentFansubIndex, setCurrentFansubIndex] = useState(0)
  const [imageCount, setImageCount] = useState(0)
  
  const [formData, setFormData] = useState({
    chapterNumber: '',
    chapterTitle: ''
  })

  useEffect(() => {
    loadChapter()
  }, [slug, chapterId])

  const loadChapter = async () => {
    try {
      const mangas = await getAllMangas()
      const foundManga = mangas.find(m => m.slug === slug)
      
      if (!foundManga) {
        alert('Manga bulunamadı!')
        navigate('/admin/chapters')
        return
      }
      
      const foundChapter = foundManga.chapters?.find(ch => ch.id === chapterId)
      
      if (!foundChapter) {
        alert('Bölüm bulunamadı!')
        navigate('/admin/chapters')
        return
      }
      
      setManga(foundManga)
      setChapter(foundChapter)
      
      // Set form data
      setFormData({
        chapterNumber: foundChapter.id,
        chapterTitle: foundChapter.title || ''
      })
      
      // Set fansubs
      if (foundChapter.fansubs && foundChapter.fansubs.length > 0) {
        setFansubs(foundChapter.fansubs.map(f => ({
          name: f.name || '',
          website: f.website || '',
          discord: f.discord || '',
          note: f.note || '',
          images: f.images.join('\n')
        })))
        const count = foundChapter.fansubs[0].images.length
        setImageCount(count)
      } else {
        // Create from imageLinks
        setFansubs([{
          name: foundManga.fansub || 'Default',
          website: '',
          discord: '',
          note: '',
          images: (foundChapter.imageLinks || []).join('\n')
        }])
        setImageCount(foundChapter.imageLinks?.length || 0)
      }
      
    } catch (error) {
      console.error('Error loading chapter:', error)
      alert('Bölüm yüklenirken hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFansubChange = (e, index) => {
    const { name, value } = e.target
    const updatedFansubs = [...fansubs]
    updatedFansubs[index] = {
      ...updatedFansubs[index],
      [name]: value
    }
    setFansubs(updatedFansubs)
    
    // Count images for current fansub
    if (name === 'images') {
      const count = value.split('\n').filter(url => url.trim().length > 0).length
      setImageCount(count)
    }
  }

  const addFansub = () => {
    setFansubs([...fansubs, {
      name: '',
      website: '',
      discord: '',
      note: '',
      images: ''
    }])
    setCurrentFansubIndex(fansubs.length)
  }

  const removeFansub = (index) => {
    if (fansubs.length > 1) {
      const updatedFansubs = fansubs.filter((_, i) => i !== index)
      setFansubs(updatedFansubs)
      setCurrentFansubIndex(Math.max(0, index - 1))
    } else {
      alert('En az bir fansub olmalı!')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.chapterNumber) {
      alert('⚠️ Bölüm numarası gerekli!')
      return
    }
    
    // Check if at least one fansub has name and images
    const validFansubs = fansubs.filter(f => f.name && f.images)
    if (validFansubs.length === 0) {
      alert('⚠️ En az bir fansub adı ve resim gerekli!')
      return
    }

    setSaving(true)

    try {
      // Process fansubs
      const processedFansubs = validFansubs.map(fansub => {
        const imageLinks = fansub.images
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0)
        
        return {
          name: fansub.name,
          images: imageLinks,
          website: fansub.website || '',
          discord: fansub.discord || '',
          note: fansub.note || ''
        }
      })
      
      // Get all images from first fansub as default imageLinks
      const defaultImageLinks = processedFansubs[0].images

      const updatedChapter = {
        id: formData.chapterNumber,
        title: formData.chapterTitle || `Bölüm ${formData.chapterNumber}`,
        imageLinks: defaultImageLinks,
        fansubs: processedFansubs
      }

      // Get auth token
      const token = localStorage.getItem('admin_token')
      if (!token) {
        alert('❌ Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        navigate('/admin/login')
        return
      }

      // Call API to update chapter
      const response = await fetch('/api/manga-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          operation: 'UPDATE_CHAPTER',
          slug: slug,
          chapterId: chapterId,
          chapter: updatedChapter
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Bölüm başarıyla güncellendi!')
        navigate('/admin/chapters')
      } else {
        alert('❌ Hata: ' + (result.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('❌ Bir hata oluştu: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bölüm Düzenle</h1>
          <p className="text-gray-400 text-sm mt-1">
            {manga?.title} - Bölüm {chapter?.id}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/chapters')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕ Kapat
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chapter Info */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Bölüm Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bölüm Numarası
              </label>
              <input
                type="text"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bölüm Başlığı (Opsiyonel)
              </label>
              <input
                type="text"
                name="chapterTitle"
                value={formData.chapterTitle}
                onChange={(e) => setFormData({ ...formData, chapterTitle: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Fansubs Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Fansub Bilgileri
            </h3>
            <button
              type="button"
              onClick={addFansub}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              + Fansub Ekle
            </button>
          </div>

          {/* Fansub Tabs */}
          {fansubs.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {fansubs.map((fansub, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentFansubIndex(index)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    currentFansubIndex === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {fansub.name || `Fansub ${index + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Current Fansub Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fansub Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={fansubs[currentFansubIndex]?.name || ''}
                onChange={(e) => handleFansubChange(e, currentFansubIndex)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={fansubs[currentFansubIndex]?.website || ''}
                  onChange={(e) => handleFansubChange(e, currentFansubIndex)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
                <input
                  type="url"
                  name="discord"
                  value={fansubs[currentFansubIndex]?.discord || ''}
                  onChange={(e) => handleFansubChange(e, currentFansubIndex)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fansub Notu</label>
              <textarea
                name="note"
                value={fansubs[currentFansubIndex]?.note || ''}
                onChange={(e) => handleFansubChange(e, currentFansubIndex)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resim URL'leri <span className="text-red-500">*</span>
                {imageCount > 0 && (
                  <span className="ml-2 text-blue-400 text-xs">({imageCount} sayfa)</span>
                )}
              </label>
              <textarea
                name="images"
                value={fansubs[currentFansubIndex]?.images || ''}
                onChange={(e) => handleFansubChange(e, currentFansubIndex)}
                rows={12}
                placeholder="Her satıra bir URL yazın"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono text-sm"
                required
              />
            </div>

            {fansubs.length > 1 && (
              <button
                type="button"
                onClick={() => removeFansub(currentFansubIndex)}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                🗑️ Bu Fansub'ı Kaldır
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/chapters')}
            disabled={saving}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? '⏳ Kaydediliyor...' : '💾 Güncelle'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChapterEdit
