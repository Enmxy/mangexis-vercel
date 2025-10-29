import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getReadingHistory, clearHistory, removeFromHistory, getReadingStats } from '../utils/readingHistory'

const ReadingHistory = () => {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all') // all, completed, inProgress

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const data = getReadingHistory()
    const statistics = getReadingStats()
    setHistory(data)
    setStats(statistics)
  }

  const handleClearAll = () => {
    if (window.confirm('Tüm okuma geçmişini silmek istediğinize emin misiniz?')) {
      clearHistory()
      loadHistory()
    }
  }

  const handleRemove = (slug, chapterId) => {
    removeFromHistory(slug, chapterId)
    loadHistory()
  }

  const filteredHistory = history.filter(item => {
    if (filter === 'completed') return item.progress === 100
    if (filter === 'inProgress') return item.progress < 100
    return true
  })

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  return (
    <div className="pt-20 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Okuma Geçmişi
          </h1>
          <p className="text-gray-400">Okuduğun manga ve bölümlerin geçmişi</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 shadow-xl">
              <div className="text-3xl font-black text-white mb-1">{stats.uniqueMangas}</div>
              <div className="text-purple-200 text-sm">Farklı Manga</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-xl">
              <div className="text-3xl font-black text-white mb-1">{stats.totalChapters}</div>
              <div className="text-blue-200 text-sm">Toplam Bölüm</div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 shadow-xl">
              <div className="text-3xl font-black text-white mb-1">{stats.completedChapters}</div>
              <div className="text-green-200 text-sm">Tamamlandı</div>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 shadow-xl">
              <div className="text-3xl font-black text-white mb-1">{stats.inProgressChapters}</div>
              <div className="text-orange-200 text-sm">Devam Ediyor</div>
            </div>
          </motion.div>
        )}

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tümü ({history.length})
            </button>
            <button
              onClick={() => setFilter('inProgress')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'inProgress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Devam Eden
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tamamlanan
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Geçmişi Temizle
            </button>
          )}
        </div>

        {/* History List */}
        <AnimatePresence mode="wait">
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {filter === 'all' ? 'Henüz okuma geçmişin yok' : 'Sonuç bulunamadı'}
              </h2>
              <p className="text-gray-400 mb-6">Manga okumaya başladığında burası dolacak!</p>
              <Link to="/discover">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
                  Manga Keşfet
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={`${item.slug}-${item.chapterId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Cover Image */}
                    <Link to={`/manga/${item.slug}`}>
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded-lg hover:scale-105 transition-transform"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200?text=No+Image' }}
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/manga/${item.slug}`}>
                        <h3 className="text-white font-bold text-lg mb-1 hover:text-purple-400 transition-colors truncate">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mb-2">{item.chapterTitle}</p>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Sayfa {item.pageNumber}/{item.totalPages}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className={`h-full rounded-full ${
                              item.progress === 100
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">
                          📅 {formatDate(item.timestamp)}
                        </span>
                        <div className="flex gap-2">
                          <Link to={`/manga/${item.slug}/chapter/${item.chapterId}`}>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
                              {item.progress === 100 ? '🔄 Tekrar Oku' : '📖 Devam Et'}
                            </button>
                          </Link>
                          <button
                            onClick={() => handleRemove(item.slug, item.chapterId)}
                            className="text-red-400 hover:text-red-300 px-2"
                            title="Sil"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ReadingHistory
