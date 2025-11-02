import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllMangas } from '../../utils/mangaService'

const ChapterList = () => {
  const [mangas, setMangas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedManga, setExpandedManga] = useState(null)

  useEffect(() => {
    loadMangas()
  }, [])

  const loadMangas = async () => {
    setLoading(true)
    try {
      const allMangas = await getAllMangas()
      // Filter only mangas with chapters
      const mangasWithChapters = allMangas.filter(m => m.chapters && m.chapters.length > 0)
      setMangas(mangasWithChapters)
    } catch (error) {
      console.error('Error loading mangas:', error)
      alert('Mangalar yüklenirken hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredMangas = mangas.filter(manga =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleManga = (slug) => {
    setExpandedManga(expandedManga === slug ? null : slug)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bölüm Listesi</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredMangas.length} manga, toplam{' '}
            {filteredMangas.reduce((sum, m) => sum + (m.chapters?.length || 0), 0)} bölüm
          </p>
        </div>
        <Link to="/admin/chapter-add">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Bölüm Ekle
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Manga ara..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Manga List */}
      <div className="space-y-4">
        {filteredMangas.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400">Bölümlü manga bulunamadı</p>
          </div>
        ) : (
          filteredMangas.map((manga) => (
            <motion.div
              key={manga.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
            >
              {/* Manga Header */}
              <button
                onClick={() => toggleManga(manga.slug)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
                    }}
                  />
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{manga.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {manga.chapters?.length || 0} bölüm
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedManga === manga.slug ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Chapters List */}
              <AnimatePresence>
                {expandedManga === manga.slug && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-700"
                  >
                    <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                      {manga.chapters
                        .sort((a, b) => parseFloat(b.id) - parseFloat(a.id))
                        .map((chapter) => (
                          <div
                            key={chapter.id}
                            className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                                {chapter.id}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {chapter.title || `Bölüm ${chapter.id}`}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <p className="text-gray-400 text-xs">
                                    {chapter.imageLinks?.length || 0} sayfa
                                  </p>
                                  {chapter.fansubs && chapter.fansubs.length > 0 && (
                                    <p className="text-green-400 text-xs">
                                      • {chapter.fansubs.length} fansub
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Link
                              to={`/admin/chapter-edit/${manga.slug}/${chapter.id}`}
                            >
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Düzenle
                              </motion.button>
                            </Link>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChapterList
