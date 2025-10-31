import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../../data/mangaData'
import { deleteManga, getAllMangas } from '../../utils/mangaService'

const MangaList = () => {
  const [mangas, setMangas] = useState([])
  const [deleteModal, setDeleteModal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMangas()
  }, [])

  const loadMangas = async () => {
    setLoading(true)
    try {
      // Try to get from API/localStorage first
      const apiMangas = await getAllMangas()
      
      // Merge with static manga data
      const allMangas = [...mangaList, ...apiMangas]
      
      // Remove duplicates by slug
      const uniqueMangas = allMangas.reduce((acc, manga) => {
        if (!acc.find(m => m.slug === manga.slug)) {
          acc.push(manga)
        }
        return acc
      }, [])
      
      setMangas(uniqueMangas)
    } catch (error) {
      console.error('Error loading mangas:', error)
      setMangas(mangaList)
    } finally {
      setLoading(false)
    }
  }

  const filteredMangas = mangas.filter(manga =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (slug) => {
    setDeleteModal(slug)
  }

  const confirmDelete = async () => {
    try {
      await deleteManga(deleteModal)
      setMangas(mangas.filter(m => m.slug !== deleteModal))
      setDeleteModal(null)
      alert('Manga başarıyla silindi!')
      await loadMangas() // Reload list
    } catch (error) {
      alert('Silme hatası: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      ongoing: 'bg-green-500/20 text-green-400 border-green-500/50',
      finished: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      hiatus: 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    }
    const labels = {
      ongoing: 'Devam Ediyor',
      finished: 'Tamamlandı',
      hiatus: 'Ara Verildi'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.ongoing}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manga Listesi</h1>
          <p className="text-gray-400 text-sm mt-1">{filteredMangas.length} manga bulundu</p>
        </div>
        <Link to="/admin/mangas/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Manga Ekle
          </motion.button>
        </Link>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Manga ara..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </motion.div>

      {/* Manga Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMangas.map((manga, index) => (
          <motion.div
            key={manga.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
          >
            {/* Cover Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-700">
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
                }}
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(manga.status)}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
                {manga.title}
              </h3>
              <div className="flex flex-wrap gap-1 mb-3">
                {manga.genres?.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {manga.description}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Link to={`/admin/mangas/edit/${manga.slug}`} className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(manga.slug)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  title="Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMangas.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="flex justify-center mb-4">
            <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg mb-2">Manga bulunamadı</p>
          <p className="text-gray-500 text-sm">Yeni manga ekleyerek başlayın</p>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Mangayı Sil</h3>
                <p className="text-gray-400 text-sm">
                  Bu mangayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sil
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MangaList
