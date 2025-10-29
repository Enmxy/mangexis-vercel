import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllNews } from '../utils/newsService'

const NewsDetail = () => {
  const { slug } = useParams()
  const [news, setNews] = useState(null)
  const [relatedNews, setRelatedNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [slug])

  const loadNews = async () => {
    setLoading(true)
    try {
      const allNews = await getAllNews()
      const current = allNews.find(n => n.slug === slug)
      setNews(current)

      // Get related news (same tags or recent)
      if (current) {
        const related = allNews
          .filter(n => n.slug !== slug)
          .filter(n => n.tags?.some(tag => current.tags?.includes(tag)) || true)
          .slice(0, 3)
        setRelatedNews(related)
      }
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-4">Haber Bulunamadı</h1>
        <Link to="/news">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
            Haberlere Dön
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Back Button */}
        <Link to="/news">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Haberlere Dön
          </motion.button>
        </Link>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
        >
          {/* Featured Image */}
          {news.image && (
            <div className="relative h-96 overflow-hidden">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x600?text=News' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Meta */}
            <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm">
              <span className="flex items-center gap-2">
                📅 {new Date(news.date).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {news.tags && news.tags.length > 0 && (
                <div className="flex gap-2">
                  {news.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-black text-white mb-6 leading-tight">
              {news.title}
            </h1>

            {/* Excerpt */}
            {news.excerpt && (
              <p className="text-xl text-gray-300 mb-8 leading-relaxed font-medium border-l-4 border-purple-600 pl-4">
                {news.excerpt}
              </p>
            )}

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {news.content}
              </div>
            </div>
          </div>
        </motion.article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">İlgili Haberler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((item, index) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/news/${item.slug}`}>
                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group">
                      {item.image && (
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=News' }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {new Date(item.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsDetail
