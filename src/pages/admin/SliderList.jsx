import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllSliders, deleteSlider } from '../../utils/sliderService'

const SliderList = () => {
  const [sliders, setSliders] = useState([])
  const [deleteModal, setDeleteModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewSlider, setPreviewSlider] = useState(null)

  useEffect(() => {
    loadSliders()
  }, [])

  const loadSliders = async () => {
    setLoading(true)
    try {
      const data = await getAllSliders()
      setSliders(data)
    } catch (error) {
      console.error('Error loading sliders:', error)
      setSliders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id) => {
    setDeleteModal(id)
  }

  const confirmDelete = async () => {
    try {
      await deleteSlider(deleteModal)
      setSliders(sliders.filter(s => s.id !== deleteModal))
      setDeleteModal(null)
      alert('Slider başarıyla silindi!')
    } catch (error) {
      alert('Silme hatası: ' + error.message)
    }
  }

  const getTypeInfo = (type) => {
    const types = {
      manga: { label: 'Manga', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', icon: '📚' },
      news: { label: 'Haber', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: '📰' },
      announcement: { label: 'Duyuru', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', icon: '📢' }
    }
    return types[type] || types.manga
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Slider Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-1">{sliders.length} slider bulundu</p>
        </div>
        <Link to="/admin/sliders/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200"
          >
            ➕ Yeni Slider Ekle
          </motion.button>
        </Link>
      </div>

      {/* Preview Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <span>💡</span>
          <span>Sliderlar ana sayfada otomatik olarak döngüde gösterilir. Preview için bir slider'a tıklayın.</span>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Slider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.map((slider, index) => {
              const typeInfo = getTypeInfo(slider.type)
              
              return (
                <motion.div
                  key={slider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer"
                  onClick={() => setPreviewSlider(slider)}
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-gray-700">
                    <img
                      src={slider.image}
                      alt={slider.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${typeInfo.color} backdrop-blur-sm`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
                      {slider.title}
                    </h3>
                    {slider.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {slider.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/admin/sliders/edit/${slider.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(slider.id)
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Empty State */}
          {sliders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-400 text-lg mb-2">Henüz slider eklenmemiş</p>
              <p className="text-gray-500 text-sm">İlk slider'ı ekleyerek başlayın</p>
            </motion.div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewSlider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewSlider(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full border border-gray-700 shadow-2xl overflow-hidden"
            >
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">🎬 Slider Preview</h3>
                  <button
                    onClick={() => setPreviewSlider(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="relative">
                <img
                  src={previewSlider.image}
                  alt={previewSlider.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-white mb-3">{previewSlider.title}</h2>
                    {previewSlider.description && (
                      <p className="text-gray-300 text-lg mb-4">{previewSlider.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      {previewSlider.buttonText && (
                        <button className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                          {previewSlider.buttonText}
                        </button>
                      )}
                      {getTypeInfo(previewSlider.type) && (
                        <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getTypeInfo(previewSlider.type).color} backdrop-blur-sm`}>
                          {getTypeInfo(previewSlider.type).icon} {getTypeInfo(previewSlider.type).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="p-6 bg-gray-800/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Link:</span>
                    <span className="text-white ml-2">{previewSlider.link || 'Yok'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Buton Metni:</span>
                    <span className="text-white ml-2">{previewSlider.buttonText || 'Yok'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xl font-bold text-white mb-2">Slider'ı Sil</h3>
                <p className="text-gray-400 text-sm">
                  Bu slider'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default SliderList
