import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const PagesList = () => {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/custom-pages')
      const data = await response.json()
      if (data.success) {
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async (slug) => {
    try {
      const response = await fetch(`/.netlify/functions/custom-pages?slug=${slug}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        setPages(pages.filter(p => p.slug !== slug))
        setDeleteModal(null)
        alert('✅ Sayfa silindi!')
      } else {
        alert('❌ Hata: ' + result.error)
      }
    } catch (error) {
      alert('❌ Bir hata oluştu: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Özel Sayfalar</h1>
          <p className="text-gray-400 text-sm mt-1">{pages.length} sayfa bulundu</p>
        </div>
        <Link to="/admin/pages/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white hover:bg-gray-200 text-black font-semibold py-2 px-6 rounded-lg transition-all duration-200"
          >
            ➕ Yeni Sayfa
          </motion.button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {pages.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-400 text-lg mb-2">Henüz özel sayfa oluşturulmamış</p>
              <p className="text-gray-500 text-sm">İlk sayfayı oluşturarak başlayın</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page, index) => (
                <motion.div
                  key={page.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-white/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">{page.title}</h3>
                      <p className="text-gray-400 text-sm">/{page.slug}</p>
                    </div>
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                      {page.sections?.length || 0} bölüm
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/pages/${page.slug}`} target="_blank" className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                      >
                        👁️ Görüntüle
                      </motion.button>
                    </Link>
                    <Link to={`/admin/pages/edit/${page.slug}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                      >
                        ✏️ Düzenle
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteModal(page.slug)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                    >
                      🗑️
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-2">Sayfayı Sil</h3>
            <p className="text-gray-400 text-sm mb-6">
              Bu sayfayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => deletePage(deleteModal)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default PagesList
