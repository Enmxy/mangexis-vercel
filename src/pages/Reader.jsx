import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import Comments from '../components/Comments'

const Reader = () => {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const manga = mangaList.find(m => m.slug === slug)
  const chapter = manga?.chapters.find(c => c.id === chapterId)

  const [currentPage, setCurrentPage] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [selectedFansub, setSelectedFansub] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef(null)
  const controlsTimer = useRef(null)

  // Get current chapter info
  const currentChapterIndex = manga?.chapters.findIndex(c => c.id === chapterId) ?? -1
  const prevChapter = currentChapterIndex > 0 ? manga.chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < (manga?.chapters.length ?? 0) - 1 ? manga.chapters[currentChapterIndex + 1] : null

  // Get current images
  const getCurrentImages = () => {
    if (!chapter) return []
    if (chapter.fansubs && chapter.fansubs[selectedFansub]?.images) {
      return chapter.fansubs[selectedFansub].images
    }
    return chapter.imageLinks || []
  }

  const images = getCurrentImages()

  // Auto-hide controls
  useEffect(() => {
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(controlsTimer.current)
  }, [])

  // Reset page on chapter change
  useEffect(() => {
    setCurrentPage(0)
    setImageLoaded(false)
  }, [chapterId])

  // Navigation functions
  const handleNextPage = () => {
    if (currentPage < images.length - 1) {
      setCurrentPage(prev => prev + 1)
      setImageLoaded(false)
    } else if (nextChapter) {
      navigate(`/manga/${slug}/chapter/${nextChapter.id}`)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
      setImageLoaded(false)
    }
  }

  const handleImageClick = (e) => {
    const clickX = e.clientX
    const windowWidth = window.innerWidth
    
    if (clickX > windowWidth * 0.66) {
      handleNextPage()
    } else if (clickX < windowWidth * 0.33) {
      handlePrevPage()
    } else {
      setShowControls(!showControls)
    }
  }

  const handleChapterChange = (newChapterId) => {
    navigate(`/manga/${slug}/chapter/${newChapterId}`)
  }

  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        handleNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        handlePrevPage()
      } else if (e.key === 'f') {
        toggleFullscreen()
      } else if (e.key === 'Escape') {
        if (isFullscreen) exitFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, images.length, nextChapter, isFullscreen])

  // Mouse move handler
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  if (!manga || !chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">❌ Bölüm bulunamadı</p>
          <Link to={`/manga/${slug}`}>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all">
              ← Manga Sayfasına Dön
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Top Controls Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-white/20"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Back & Info */}
                <div className="flex items-center gap-3">
                  <Link to={`/manga/${slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-white text-black hover:bg-gray-200 rounded transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </motion.button>
                  </Link>
                  <div className="hidden md:block">
                    <h2 className="text-sm font-bold text-white">{manga.title}</h2>
                    <p className="text-xs text-gray-500">{chapter.title}</p>
                  </div>
                </div>

                {/* Center: Chapter Navigation */}
                <div className="flex items-center gap-2">
                  {prevChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterChange(prevChapter.id)}
                      className="p-2 bg-white text-black hover:bg-gray-200 rounded transition-all"
                      title="Önceki Bölüm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                  )}

                  <select
                    value={chapterId}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="px-3 py-2 bg-white text-black border-2 border-white rounded text-sm font-bold cursor-pointer focus:outline-none focus:border-gray-300 transition-all max-w-[150px]"
                  >
                    {manga.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>

                  {nextChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterChange(nextChapter.id)}
                      className="p-2 bg-white text-black hover:bg-gray-200 rounded transition-all"
                      title="Sonraki Bölüm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  )}
                </div>

                {/* Right: Settings */}
                <div className="flex items-center gap-2">
                  {/* Fansub Selector */}
                  {chapter.fansubs && chapter.fansubs.length > 1 && (
                    <select
                      value={selectedFansub}
                      onChange={(e) => setSelectedFansub(parseInt(e.target.value))}
                      className="px-3 py-2 bg-white text-black border-2 border-white rounded text-xs font-bold cursor-pointer focus:outline-none focus:border-gray-300 transition-all"
                    >
                      {chapter.fansubs.map((fansub, index) => (
                        <option key={index} value={index}>
                          {fansub.name || `Fansub ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Fullscreen Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFullscreen}
                    className="p-2 bg-white text-black hover:bg-gray-200 rounded transition-all"
                    title={isFullscreen ? "Tam Ekrandan Çık (F)" : "Tam Ekran (F)"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white font-mono mb-1.5">
                  <span>Sayfa {currentPage + 1} / {images.length}</span>
                  <span>{Math.round(((currentPage + 1) / images.length) * 100)}%</span>
                </div>
                <div className="relative w-full h-1 bg-gray-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentPage + 1) / images.length) * 100}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute h-full bg-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image Display */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative max-w-full max-h-screen"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <img
              ref={imageRef}
              src={images[currentPage]}
              alt={`Page ${currentPage + 1}`}
              onClick={handleImageClick}
              onLoad={() => setImageLoaded(true)}
              className={`max-w-full max-h-screen object-contain cursor-pointer transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side Navigation Zones */}
      <AnimatePresence>
        {showControls && (
          <>
            {currentPage > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed left-0 top-0 bottom-0 w-1/3 z-30 cursor-w-resize group"
                onClick={handlePrevPage}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-white rounded-full shadow-lg">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}

            {currentPage < images.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed right-0 top-0 bottom-0 w-1/3 z-30 cursor-e-resize group"
                onClick={handleNextPage}
              >
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-white rounded-full shadow-lg">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Bottom Hint */}
      <AnimatePresence>
        {showControls && currentPage === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-white px-6 py-3 rounded-full shadow-lg">
              <p className="text-sm text-black font-mono flex items-center gap-2">
                <span className="hidden sm:inline">← Önceki | Ortaya Tıkla: Kontroller | Sonraki →</span>
                <span className="sm:hidden">← | Tıkla | →</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      {currentPage === images.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto px-4 py-12"
        >
          <Comments 
            identifier={`chapter-${manga.slug}-${chapterId}`}
            title={`${manga.title} - ${chapter.title}`}
          />
        </motion.div>
      )}
    </div>
  )
}

export default Reader
