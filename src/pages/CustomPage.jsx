import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const CustomPage = () => {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPage()
  }, [slug])

  const loadPage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/custom-pages')
      const data = await response.json()
      if (data.success) {
        const foundPage = data.pages.find(p => p.slug === slug)
        setPage(foundPage || null)
      }
    } catch (error) {
      console.error('Error loading page:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderSection = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12">
            <img 
              src={section.content.image} 
              alt={section.content.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-center justify-center">
              <div className="text-center text-white max-w-3xl px-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-black mb-4"
                >
                  {section.content.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl mb-8 text-gray-200"
                >
                  {section.content.subtitle}
                </motion.p>
                {section.content.buttonText && section.content.buttonLink && (
                  <motion.a
                    href={section.content.buttonLink}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="inline-block bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
                  >
                    {section.content.buttonText}
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="prose prose-invert max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">{section.content.title}</h2>
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {section.content.text}
            </p>
          </div>
        )
      
      case 'image':
        return (
          <div className="mb-12 max-w-4xl mx-auto">
            <img 
              src={section.content.image} 
              alt={section.content.caption || ''}
              className="w-full rounded-2xl shadow-2xl"
            />
            {section.content.caption && (
              <p className="text-center text-gray-400 mt-4 text-sm">
                {section.content.caption}
              </p>
            )}
          </div>
        )
      
      case 'gallery':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
            {section.content.images.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                alt=""
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-full aspect-square object-cover rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer"
              />
            ))}
          </div>
        )
      
      case 'cards':
        return (
          <div className="mb-12 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {section.content.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.content.cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all"
                >
                  <div className="text-6xl mb-4">{card.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-gray-300">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-white mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-400 mb-8">Aradığınız sayfa mevcut değil.</p>
          <a href="/" className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {page.sections.map((section) => (
          <div key={section.id}>
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomPage
