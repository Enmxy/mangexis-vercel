import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Slider from '../components/Slider'
import SearchFilter from '../components/SearchFilter'
import MangaCard from '../components/MangaCard'
import { sliderData, mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [allMangas, setAllMangas] = useState(mangaList)
  const [filteredMangas, setFilteredMangas] = useState(mangaList)
  const [showIntro, setShowIntro] = useState(true)
  const [loading, setLoading] = useState(true)

  // Load mangas from API/localStorage + static data
  useEffect(() => {
    loadAllMangas()
  }, [])

  const loadAllMangas = async () => {
    setLoading(true)
    try {
      const apiMangas = await getAllMangas()
      const combined = [...mangaList, ...apiMangas]
      
      // Remove duplicates by slug
      const unique = combined.reduce((acc, manga) => {
        if (!acc.find(m => m.slug === manga.slug)) {
          acc.push(manga)
        }
        return acc
      }, [])
      
      setAllMangas(unique)
      setFilteredMangas(unique)
    } catch (error) {
      console.error('Error loading mangas:', error)
      setAllMangas(mangaList)
      setFilteredMangas(mangaList)
    } finally {
      setLoading(false)
    }
  }

  // Extract all unique genres
  const availableGenres = [...new Set(allMangas.flatMap(manga => manga.genres))].sort()

  // Hide intro animation after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = allMangas

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(manga => manga.status === statusFilter)
    }

    // Filter by genre
    if (genreFilter !== 'all') {
      filtered = filtered.filter(manga => manga.genres.includes(genreFilter))
    }

    setFilteredMangas(filtered)
  }, [searchTerm, statusFilter, genreFilter, allMangas])

  return (
    <>
      {/* Loading Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-mono text-white mb-2">
                MangeXis
              </h1>
              <p className="text-tertiary text-xs sm:text-sm tracking-widest">
                PREMIUM MANGA PLATFORM
              </p>
            </motion.div>

            {/* Loading Spinner */}
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 min-h-screen">
        {/* Hero Slider */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
        >
          <Slider slides={sliderData} />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{allMangas.length}</div>
              <div className="text-xs sm:text-sm text-gray-400">Toplam Manga</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {allMangas.reduce((sum, m) => sum + (m.chapters?.length || 0), 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Toplam Bölüm</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{availableGenres.length}</div>
              <div className="text-xs sm:text-sm text-gray-400">Tür</div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tüm Mangalar</h2>
            <div className="w-20 h-1 bg-white rounded-full"></div>
          </motion.div>

          {/* Search & Filter */}
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            genreFilter={genreFilter}
            setGenreFilter={setGenreFilter}
            availableGenres={availableGenres}
          />

          {/* Manga Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : filteredMangas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredMangas.map((manga, index) => (
                  <motion.div
                    key={manga.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MangaCard manga={manga} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-lg">Manga bulunamadı</p>
                <p className="text-gray-600 text-sm mt-2">Farklı filtreler deneyin</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default HomePage
