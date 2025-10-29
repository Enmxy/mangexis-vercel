import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllNews } from '../utils/newsService'

const News = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('all')

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    setLoading(true)
    try {
      const data = await getAllNews()
      setNews(data)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get all unique tags
  const allTags = [...new Set(news.flatMap(n => n.tags || []))]

  // Filter by tag
  const filteredNews = selectedTag === 'all' 
    ? news 
    : news.filter(n => n.tags?.includes(selectedTag))

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Haberler yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Haberler & Duyurular
          </h1>
          <p className="text-gray-400 text-lg">Manga dünyasından en son haberler, duyurular ve güncellemeler</p>
        </motion.div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-8 justify-center"
          >
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTag === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tümü ({news.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tag} ({news.filter(n => n.tags?.includes(tag)).length})
              </button>
            ))}
          </motion.div>
        )}

        {/* News Grid */}
        <AnimatePresence mode="wait">
          {filteredNews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-xl">Henüz haber yok</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedTag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredNews.map((item, index) => (
                <motion.article
                  key={item.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=News' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Date & Tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">
                        📅 {new Date(item.date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white font-bold text-xl mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                      {item.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {item.excerpt || item.content?.substring(0, 150) + '...'}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <Link to={`/news/${item.slug}`}>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors">
                        Devamını Oku →
                      </button>
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default News
