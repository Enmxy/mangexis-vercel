import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../../data/mangaData'
import { deleteManga } from '../../utils/mangaService'

const MangaList = () => {
  const [mangas, setMangas] = useState([])
  const [deleteModal, setDeleteModal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Load mangas from data
    setMangas(mangaList)
  }, [])

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
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200"
          >
            ➕ Yeni Manga Ekle
          </motion.button>
        </Link>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Manga ara..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    ✏️ Düzenle
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(manga.slug)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🗑️
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
          <div className="text-6xl mb-4">📚</div>
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
                <div className="text-5xl mb-4">⚠️</div>
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
