import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mangaList } from '../../data/mangaData'
import { getAllMangas } from '../../utils/mangaService'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMangas: 0,
    ongoing: 0,
    completed: 0,
    totalChapters: 0,
    recentMangas: []
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const apiMangas = await getAllMangas()
      const allMangas = [...mangaList, ...apiMangas]
      const totalChapters = allMangas.reduce((sum, m) => sum + (m.chapters?.length || 0), 0)
      
      setStats({
        totalMangas: allMangas.length,
        ongoing: allMangas.filter(m => m.status === 'ongoing').length,
        completed: allMangas.filter(m => m.status === 'completed').length,
        totalChapters,
        recentMangas: allMangas.slice(0, 5)
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      const totalChapters = mangaList.reduce((sum, m) => sum + (m.chapters?.length || 0), 0)
      setStats({
        totalMangas: mangaList.length,
        ongoing: mangaList.filter(m => m.status === 'ongoing').length,
        completed: mangaList.filter(m => m.status === 'completed').length,
        totalChapters,
        recentMangas: mangaList.slice(0, 5)
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-400 text-lg">MangeXis yönetim paneline hoş geldiniz 🚀</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-2xl p-6 shadow-2xl shadow-purple-500/30 border border-purple-400/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-white/60 text-sm font-medium">TOPLAM</div>
          </div>
          <p className="text-5xl font-black text-white mb-1">{stats.totalMangas}</p>
          <p className="text-purple-200 text-sm font-medium">Manga</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 shadow-2xl shadow-blue-500/30 border border-blue-400/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-white/60 text-sm font-medium">DEVAM</div>
          </div>
          <p className="text-5xl font-black text-white mb-1">{stats.ongoing}</p>
          <p className="text-blue-200 text-sm font-medium">Devam Eden</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl p-6 shadow-2xl shadow-green-500/30 border border-green-400/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-white/60 text-sm font-medium">BİTTİ</div>
          </div>
          <p className="text-5xl font-black text-white mb-1">{stats.completed}</p>
          <p className="text-green-200 text-sm font-medium">Tamamlandı</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 rounded-2xl p-6 shadow-2xl shadow-orange-500/30 border border-orange-400/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">📖</span>
            </div>
            <div className="text-white/60 text-sm font-medium">BÖLÜM</div>
          </div>
          <p className="text-5xl font-black text-white mb-1">{stats.totalChapters}</p>
          <p className="text-orange-200 text-sm font-medium">Toplam Bölüm</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/sliders/new">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, x: 10 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all cursor-pointer border border-blue-400/30"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform backdrop-blur-sm">
                  🎬
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-2xl mb-2">Slider Ekle</h3>
                  <p className="text-blue-100 text-sm">Ana sayfada gösterilecek slider oluşturun</p>
                </div>
                <div className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all text-2xl">
                  →
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/mangas/new">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, x: 10 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all cursor-pointer border border-purple-400/30"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform backdrop-blur-sm">
                  ➕
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-2xl mb-2">Yeni Manga Ekle</h3>
                  <p className="text-purple-100 text-sm">Kütüphaneye yeni manga ekleyerek koleksiyonunuzu genişletin</p>
                </div>
                <div className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all text-2xl">
                  →
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/mangas">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, x: 10 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all cursor-pointer border border-blue-400/30"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform backdrop-blur-sm">
                  📝
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-2xl mb-2">Mangaları Yönet</h3>
                  <p className="text-blue-100 text-sm">Mevcut mangaları düzenleyin, silin veya güncelleyin</p>
                </div>
                <div className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all text-2xl">
                  →
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Recent Mangas */}
      {stats.recentMangas.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Son Eklenen Mangalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentMangas.map((manga, index) => (
              <motion.div
                key={manga.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-all"
              >
                <div className="flex gap-4">
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-16 h-24 object-cover rounded-lg"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200?text=No+Image' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{manga.title}</h3>
                    <p className="text-gray-400 text-sm">{manga.chapters?.length || 0} bölüm</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {manga.genres?.slice(0, 2).map(genre => (
                        <span key={genre} className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
