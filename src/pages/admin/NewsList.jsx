import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllNews, deleteNews } from '../../utils/newsService'

const NewsList = () => {
  const [news, setNews] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`"${title}" haberini silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      await deleteNews(slug)
      alert('✅ Haber silindi!')
      loadNews()
    } catch (error) {
      alert('❌ Silme hatası: ' + error.message)
    }
  }

  const filteredNews = news.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Haberler</h1>
          <p className="text-gray-400">Manga haberleri yönetimi</p>
        </div>
        <Link to="/admin/news/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            ➕ Yeni Haber Ekle
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <input
          type="text"
          placeholder="Haber ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/80 text-sm font-medium">Toplam Haber</h3>
            <span className="text-3xl">📰</span>
          </div>
          <p className="text-4xl font-black text-white">{news.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/80 text-sm font-medium">Bu Ay</h3>
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-4xl font-black text-white">
            {news.filter(n => {
              const newsDate = new Date(n.date)
              const now = new Date()
              return newsDate.getMonth() === now.getMonth() && newsDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/80 text-sm font-medium">Bu Hafta</h3>
            <span className="text-3xl">⭐</span>
          </div>
          <p className="text-4xl font-black text-white">
            {news.filter(n => {
              const newsDate = new Date(n.date)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return newsDate >= weekAgo
            }).length}
          </p>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
            >
              <p className="text-gray-400 text-lg">
                {searchTerm ? 'Haber bulunamadı' : 'Henüz haber yok. İlk haberi ekleyin!'}
              </p>
            </motion.div>
          ) : (
            filteredNews.map((item, index) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=News' }}
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-bold text-xl mb-1">{item.title}</h3>
                        <p className="text-gray-400 text-sm">
                          📅 {new Date(item.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/admin/news/edit/${item.slug}`}>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                            ✏️ Düzenle
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.slug, item.title)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{item.excerpt}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default NewsList
