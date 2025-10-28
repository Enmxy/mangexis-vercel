import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMangas: 0,
    ongoingMangas: 0,
    completedMangas: 0,
    totalChapters: 0
  })

  useEffect(() => {
    // Load manga data and calculate stats
    const loadStats = async () => {
      try {
        const response = await fetch('/src/data/mangaData.js')
        // In production, this would read from the mangas folder
        // For now, we'll use placeholder data
        setStats({
          totalMangas: 9,
          ongoingMangas: 4,
          completedMangas: 5,
          totalChapters: 18
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { label: 'Toplam Manga', value: stats.totalMangas, icon: '📚', color: 'from-purple-600 to-purple-700', link: '/admin/mangas' },
    { label: 'Devam Eden', value: stats.ongoingMangas, icon: '🔄', color: 'from-green-600 to-green-700', link: '/admin/mangas' },
    { label: 'Tamamlanan', value: stats.completedMangas, icon: '✅', color: 'from-blue-600 to-blue-700', link: '/admin/mangas' },
    { label: 'Toplam Bölüm', value: stats.totalChapters, icon: '📖', color: 'from-orange-600 to-orange-700', link: '/admin/mangas' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Hoş Geldiniz! 👋
        </h1>
        <p className="text-purple-100">
          MangeXis admin paneline hoş geldiniz. Manga yönetimi için hazırsınız.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={stat.label} to={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{stat.icon}</span>
                <div className="text-right">
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/mangas/new">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors cursor-pointer border border-gray-600"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">➕</span>
                <div>
                  <p className="text-white font-medium">Yeni Manga Ekle</p>
                  <p className="text-gray-400 text-sm">Hızlıca manga ekleyin</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/mangas">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors cursor-pointer border border-gray-600"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div>
                  <p className="text-white font-medium">Mangaları Görüntüle</p>
                  <p className="text-gray-400 text-sm">Tüm mangaları listele</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <a href="/admin" target="_blank" rel="noopener noreferrer">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors cursor-pointer border border-gray-600"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                <div>
                  <p className="text-white font-medium">Decap CMS</p>
                  <p className="text-gray-400 text-sm">Gelişmiş düzenleme</p>
                </div>
              </div>
            </motion.div>
          </a>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Son Aktiviteler</h2>
        <div className="space-y-3">
          {[
            { action: 'Naruto eklendi', time: '2 dakika önce', icon: '➕', color: 'text-green-400' },
            { action: 'Jujutsu Kaisen güncellendi', time: '15 dakika önce', icon: '✏️', color: 'text-blue-400' },
            { action: 'Attack on Titan kapağı değiştirildi', time: '1 saat önce', icon: '🖼️', color: 'text-purple-400' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
            >
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{activity.action}</p>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
