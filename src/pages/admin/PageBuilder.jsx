import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const PageBuilder = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = !!slug
  
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState({
    slug: '',
    title: '',
    sections: []
  })
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPages()
    if (isEdit) {
      loadPage(slug)
    }
  }, [slug])

  const loadPages = async () => {
    try {
      const response = await fetch('/.netlify/functions/custom-pages')
      const data = await response.json()
      if (data.success) {
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    }
  }

  const loadPage = async (pageSlug) => {
    const page = pages.find(p => p.slug === pageSlug)
    if (page) {
      setCurrentPage(page)
    }
  }

  const addSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      content: getDefaultContent(type)
    }
    setCurrentPage({
      ...currentPage,
      sections: [...currentPage.sections, newSection]
    })
  }

  const getDefaultContent = (type) => {
    switch (type) {
      case 'hero':
        return {
          title: 'Başlık Yazın',
          subtitle: 'Alt başlık yazın',
          image: 'https://via.placeholder.com/1920x600',
          buttonText: 'Devam Et',
          buttonLink: '/'
        }
      case 'text':
        return {
          title: 'Bölüm Başlığı',
          text: 'Metin içeriğinizi buraya yazın...'
        }
      case 'image':
        return {
          image: 'https://via.placeholder.com/800x400',
          caption: 'Resim açıklaması'
        }
      case 'gallery':
        return {
          images: [
            'https://via.placeholder.com/400x300',
            'https://via.placeholder.com/400x300',
            'https://via.placeholder.com/400x300'
          ]
        }
      case 'cards':
        return {
          title: 'Kartlar Bölümü',
          cards: [
            { title: 'Kart 1', text: 'Açıklama 1', icon: '📚' },
            { title: 'Kart 2', text: 'Açıklama 2', icon: '🎨' },
            { title: 'Kart 3', text: 'Açıklama 3', icon: '⚡' }
          ]
        }
      default:
        return {}
    }
  }

  const updateSection = (sectionId, content) => {
    setCurrentPage({
      ...currentPage,
      sections: currentPage.sections.map(s => 
        s.id === sectionId ? { ...s, content } : s
      )
    })
  }

  const deleteSection = (sectionId) => {
    setCurrentPage({
      ...currentPage,
      sections: currentPage.sections.filter(s => s.id !== sectionId)
    })
  }

  const moveSectionUp = (index) => {
    if (index === 0) return
    const newSections = [...currentPage.sections]
    ;[newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]]
    setCurrentPage({ ...currentPage, sections: newSections })
  }

  const moveSectionDown = (index) => {
    if (index === currentPage.sections.length - 1) return
    const newSections = [...currentPage.sections]
    ;[newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
    setCurrentPage({ ...currentPage, sections: newSections })
  }

  const savePage = async () => {
    if (!currentPage.slug || !currentPage.title) {
      alert('⚠️ Sayfa slug ve başlığı gerekli!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/custom-pages', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPage)
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Sayfa başarıyla kaydedildi!')
        navigate('/admin/pages')
      } else {
        alert('❌ Hata: ' + result.error)
      }
    } catch (error) {
      alert('❌ Bir hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderSectionPreview = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img src={section.content.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">{section.content.title}</h2>
                <p className="text-lg mb-4">{section.content.subtitle}</p>
                <button className="bg-white text-black px-6 py-2 rounded-lg font-semibold">
                  {section.content.buttonText}
                </button>
              </div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">{section.content.title}</h3>
            <p className="text-gray-300">{section.content.text}</p>
          </div>
        )
      case 'image':
        return (
          <div className="rounded-lg overflow-hidden">
            <img src={section.content.image} alt="" className="w-full h-48 object-cover" />
            {section.content.caption && (
              <p className="text-center text-gray-400 text-sm mt-2">{section.content.caption}</p>
            )}
          </div>
        )
      case 'gallery':
        return (
          <div className="grid grid-cols-3 gap-4">
            {section.content.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
            ))}
          </div>
        )
      case 'cards':
        return (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{section.content.title}</h3>
            <div className="grid grid-cols-3 gap-4">
              {section.content.cards.map((card, i) => (
                <div key={i} className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <h4 className="text-white font-semibold mb-1">{card.title}</h4>
                  <p className="text-gray-400 text-sm">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Sayfayı Düzenle' : 'Yeni Sayfa Oluştur'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Görsel sayfa oluşturucu</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPreview(!preview)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {preview ? '✏️ Düzenle' : '👁️ Önizle'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={savePage}
            disabled={loading}
            className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
          </motion.button>
        </div>
      </div>

      {!preview ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Page Settings */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Sayfa Ayarları</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm mb-2">Sayfa Slug (URL)</label>
                  <input
                    type="text"
                    value={currentPage.slug}
                    onChange={(e) => setCurrentPage({ ...currentPage, slug: e.target.value })}
                    placeholder="ornek-sayfa"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm mb-2">Sayfa Başlığı</label>
                  <input
                    type="text"
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                    placeholder="Örnek Sayfa"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section Types */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Bölüm Ekle</h3>
              <div className="space-y-2">
                <button onClick={() => addSection('hero')} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
                  🎯 Hero Bölümü
                </button>
                <button onClick={() => addSection('text')} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
                  📝 Metin Bölümü
                </button>
                <button onClick={() => addSection('image')} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
                  🖼️ Resim Bölümü
                </button>
                <button onClick={() => addSection('gallery')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
                  🎨 Galeri Bölümü
                </button>
                <button onClick={() => addSection('cards')} className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
                  🃏 Kart Bölümü
                </button>
              </div>
            </div>
          </div>

          {/* Right: Page Builder */}
          <div className="lg:col-span-2 space-y-4">
            {currentPage.sections.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 border-dashed text-center">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-400">Soldan bölüm ekleyerek başlayın</p>
              </div>
            ) : (
              currentPage.sections.map((section, index) => (
                <div key={section.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold text-sm">
                      {section.type.toUpperCase()} Bölümü
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => moveSectionUp(index)} className="text-gray-400 hover:text-white">
                        ↑
                      </button>
                      <button onClick={() => moveSectionDown(index)} className="text-gray-400 hover:text-white">
                        ↓
                      </button>
                      <button onClick={() => deleteSection(section.id)} className="text-red-400 hover:text-red-300">
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Section Editor - Simple JSON textarea for now */}
                  <textarea
                    value={JSON.stringify(section.content, null, 2)}
                    onChange={(e) => {
                      try {
                        updateSection(section.id, JSON.parse(e.target.value))
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs font-mono"
                    rows={8}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Preview Mode
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-white mb-4">{currentPage.title}</h1>
            {currentPage.sections.map((section) => (
              <div key={section.id}>
                {renderSectionPreview(section)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PageBuilder
