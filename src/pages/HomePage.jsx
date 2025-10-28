import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Slider from '../components/Slider'
import SearchFilter from '../components/SearchFilter'
import MangaCard from '../components/MangaCard'
import { sliderData, mangaList } from '../data/mangaData'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [filteredMangas, setFilteredMangas] = useState(mangaList)
  const [showIntro, setShowIntro] = useState(true)

  // Extract all unique genres
  const availableGenres = [...new Set(mangaList.flatMap(manga => manga.genres))].sort()

  // Hide intro animation after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = mangaList

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
  }, [searchTerm, statusFilter, genreFilter])

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative w-16 h-16 sm:w-20 sm:h-20"
            >
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full"
              />
              
              {/* Inner Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-2 border-white/10 border-b-white/60 rounded-full"
              />
              
              {/* Center Dot */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full"
              />
            </motion.div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 0.5, duration: 1.5, repeat: Infinity }}
              className="mt-8 text-tertiary text-xs sm:text-sm tracking-wider"
            >
              LOADING...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 min-h-screen">
        {/* Slider Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
        >
          <Slider slides={sliderData} />
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {filteredMangas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredMangas.map((manga) => (
                  <MangaCard key={manga.slug} manga={manga} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-tertiary text-base sm:text-lg">Manga bulunamadı</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default HomePage
