import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import Giscus from '../components/Giscus'
import imageUpscaler from '../utils/imageUpscaler'
import { addToHistory } from '../utils/readingHistory'

const Reader = () => {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBar, setShowBar] = useState(true)
  const [selectedFansub, setSelectedFansub] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(() => {
    // Mobile: 100%, Desktop: 50%
    return window.innerWidth < 768 ? 100 : 50
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const scrollContainerRef = useRef(null)
  const imageRefs = useRef([])

  // Load manga data
  useEffect(() => {
    loadManga()
  }, [slug])

  const loadManga = async () => {
    setLoading(true)
    try {
      const apiMangas = await getAllMangas()
      const combined = [...mangaList, ...apiMangas]
      const found = combined.find(m => m.slug === slug)
      setManga(found)
    } catch (error) {
      console.error('Error loading manga:', error)
      setManga(mangaList.find(m => m.slug === slug))
    } finally {
      setLoading(false)
    }
  }

  const chapter = manga?.chapters.find(c => c.id === chapterId)
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

  // Save reading progress and history
  useEffect(() => {
    if (manga && chapter) {
      const key = `reading-progress-${manga.slug}`
      localStorage.setItem(key, JSON.stringify({
        chapterId: chapter.id,
        timestamp: Date.now()
      }))
      
      // Add to reading history
      addToHistory(manga, chapter.id, currentPage, images.length)
    }
  }, [manga, chapter, currentPage, images.length])

  // Restore scroll position
  useEffect(() => {
    if (chapter && images.length > 0) {
      const key = `scroll-position-${slug}-${chapterId}`
      const savedPosition = localStorage.getItem(key)
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition))
        }, 100)
      }
    }
  }, [chapter, images.length])

  // Track scroll progress and current page
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)

      // Calculate current page based on scroll position
      const viewportCenter = scrollTop + window.innerHeight / 2
      let foundPage = 1
      imageRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect()
          const elementTop = scrollTop + rect.top
          if (viewportCenter >= elementTop) {
            foundPage = index + 1
          }
        }
      })
      setCurrentPage(foundPage)
      setPageInput(foundPage.toString())

      // Save scroll position
      const key = `scroll-position-${slug}-${chapterId}`
      localStorage.setItem(key, scrollTop.toString())

      // Auto-hide bar
      clearTimeout(window.barTimer)
      setShowBar(true)
      window.barTimer = setTimeout(() => setShowBar(false), 2000)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug, chapterId])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          handleZoomIn()
        } else if (e.key === '-') {
          e.preventDefault()
          handleZoomOut()
        } else if (e.key === '0') {
          e.preventDefault()
          handleZoomReset()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [zoomLevel])

  // Pinch to zoom for mobile
  useEffect(() => {
    let initialDistance = 0
    let initialZoom = zoomLevel

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        initialZoom = zoomLevel
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        const scale = currentDistance / initialDistance
        const newZoom = Math.min(Math.max(initialZoom * scale, 50), 200)
        setZoomLevel(Math.round(newZoom))
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [zoomLevel])

  // Tap controls
  const handleTap = (e) => {
    const clickX = e.clientX
    const windowWidth = window.innerWidth
    
    if (clickX < windowWidth * 0.25) {
      // Left tap - Previous chapter
      if (prevChapter) {
        navigate(`/manga/${slug}/chapter/${prevChapter.id}`)
        window.scrollTo(0, 0)
      }
    } else if (clickX > windowWidth * 0.75) {
      // Right tap - Next chapter
      if (nextChapter) {
        navigate(`/manga/${slug}/chapter/${nextChapter.id}`)
        window.scrollTo(0, 0)
      }
    } else {
      // Center tap - Toggle bar
      setShowBar(!showBar)
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Zoom controls
  const handleZoomIn = () => {
    if (zoomLevel < 200) setZoomLevel(prev => Math.min(200, prev + 10))
  }

  const handleZoomOut = () => {
    if (zoomLevel > 50) setZoomLevel(prev => Math.max(50, prev - 10))
  }

  const handleZoomReset = () => {
    setZoomLevel(50)
  }

  const jumpToPage = (pageNumber) => {
    const targetPage = Math.max(1, Math.min(pageNumber, images.length))
    const targetRef = imageRefs.current[targetPage - 1]
    if (targetRef) {
      const rect = targetRef.getBoundingClientRect()
      const scrollTop = window.scrollY + rect.top - 100
      window.scrollTo({ top: scrollTop, behavior: 'smooth' })
    }
  }

  const handlePageInput = (e) => {
    const value = e.target.value
    setPageInput(value)
    const pageNum = parseInt(value)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= images.length) {
      jumpToPage(pageNum)
    }
  }

  const handlePageInputBlur = () => {
    setPageInput(currentPage.toString())
  }

  // Chapter change
  const handleChapterChange = (newChapterId) => {
    navigate(`/manga/${slug}/chapter/${newChapterId}`)
    window.scrollTo(0, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#EDEDED]/20 border-t-[#EDEDED] rounded-full animate-spin" />
      </div>
    )
  }

  if (!manga || !chapter) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#EDEDED] text-xl mb-4">❌ Bölüm bulunamadı</p>
          <Link to={`/manga/${slug}`}>
            <button className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all font-bold">
              ← Manga Sayfasına Dön
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]" style={{ scrollBehavior: 'smooth' }}>
      {/* Fixed Reader Bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 border-b border-[#EDEDED]/10 backdrop-blur-sm"
          >
            <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
              {/* Mobile Layout */}
              <div className="md:hidden flex flex-col gap-2">
                {/* Top Row: Back + Page Navigation */}
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/manga/${slug}`}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 bg-[#EDEDED] text-[#0A0A0A] rounded transition-all"
                      title="Geri"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </motion.button>
                  </Link>

                  {/* Page Jump - Mobile */}
                  <div className="flex items-center gap-0.5 bg-[#EDEDED] rounded px-1.5 py-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage - 1)}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={currentPage <= 1}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <input
                      type="number"
                      min="1"
                      max={images.length}
                      value={pageInput}
                      onChange={handlePageInput}
                      onBlur={handlePageInputBlur}
                      className="w-8 px-0.5 py-0.5 text-center text-xs font-bold bg-white text-[#0A0A0A] rounded border-none focus:outline-none"
                    />
                    <span className="text-xs text-[#0A0A0A] font-medium">/{images.length}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage + 1)}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={currentPage >= images.length}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Zoom - Mobile */}
                  <div className="flex items-center gap-0.5 bg-[#EDEDED] rounded px-1 py-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomOut}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={zoomLevel <= 50}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </motion.button>
                    <span className="text-xs text-[#0A0A0A] font-bold min-w-[28px] text-center">{zoomLevel}%</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomIn}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={zoomLevel >= 200}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Bottom Row: Chapter Navigation */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-center">
                    {prevChapter && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChapterChange(prevChapter.id)}
                        className="px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded transition-all text-xs font-bold"
                      >
                        ←
                      </motion.button>
                    )}
                    <select
                      value={chapterId}
                      onChange={(e) => handleChapterChange(e.target.value)}
                      className="flex-1 px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded text-xs font-bold cursor-pointer focus:outline-none focus:bg-white transition-all"
                    >
                      {manga.chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                    </select>
                    {nextChapter && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChapterChange(nextChapter.id)}
                        className="px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded transition-all text-xs font-bold"
                      >
                        →
                      </motion.button>
                    )}
                  </div>
                  {/* Fansub Selector - Mobile */}
                  {chapter.fansubs && chapter.fansubs.length > 1 && (
                    <select
                      value={selectedFansub}
                      onChange={(e) => setSelectedFansub(parseInt(e.target.value))}
                      className="px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded text-xs font-bold cursor-pointer focus:outline-none focus:bg-white transition-all"
                    >
                      {chapter.fansubs.map((fansub, index) => (
                        <option key={index} value={index}>
                          {fansub.name || `Fansub ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between gap-3">
                {/* Left: Back */}
                <Link to={`/manga/${slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all"
                    title="Geri"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </motion.button>
                </Link>

                {/* Center: Chapter Controls */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  {prevChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterChange(prevChapter.id)}
                      className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all text-sm font-bold"
                      title="Önceki Bölüm"
                    >
                      ←
                    </motion.button>
                  )}

                  <select
                    value={chapterId}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] rounded text-sm font-bold cursor-pointer focus:outline-none focus:bg-white transition-all max-w-[200px]"
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
                      className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all text-sm font-bold"
                      title="Sonraki Bölüm"
                    >
                      →
                    </motion.button>
                  )}
                </div>

                {/* Right: Page Navigation & Settings - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Page Jump Controls */}
                  <div className="flex items-center gap-1 bg-[#EDEDED] rounded px-2 py-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(1)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="İlk Sayfa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage - 1)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Önceki Sayfa"
                      disabled={currentPage <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <input
                      type="number"
                      min="1"
                      max={images.length}
                      value={pageInput}
                      onChange={handlePageInput}
                      onBlur={handlePageInputBlur}
                      className="w-12 px-1 py-1 text-center text-xs font-bold bg-white text-[#0A0A0A] rounded border-none focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                    <span className="text-xs text-[#0A0A0A] font-medium">/ {images.length}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage + 1)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Sonraki Sayfa"
                      disabled={currentPage >= images.length}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(images.length)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Son Sayfa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>

                  {chapter.fansubs && chapter.fansubs.length > 1 && (
                    <select
                      value={selectedFansub}
                      onChange={(e) => setSelectedFansub(parseInt(e.target.value))}
                      className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] rounded text-xs font-bold cursor-pointer focus:outline-none focus:bg-white transition-all"
                    >
                      {chapter.fansubs.map((fansub, index) => (
                        <option key={index} value={index}>
                          {fansub.name || `Fansub ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  )}


                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-[#EDEDED] rounded px-2 py-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomOut}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Zoom Out"
                      disabled={zoomLevel <= 50}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleZoomReset}
                      className="px-2 py-1 text-[#0A0A0A] hover:bg-white rounded transition-all text-xs font-bold"
                      title="Reset Zoom"
                    >
                      {zoomLevel}%
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomIn}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Zoom In"
                      disabled={zoomLevel >= 200}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFullscreen}
                    className="p-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all"
                    title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
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
              <div className="mt-2">
                <div className="w-full h-1 bg-[#EDEDED]/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ duration: 0.1 }}
                    className="h-full bg-[#EDEDED]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Scroll Images */}
      <div 
        ref={scrollContainerRef}
        className="mx-auto pt-20"
        onClick={handleTap}
        style={{
          maxWidth: `${zoomLevel}%`,
          transition: 'max-width 0.3s ease-out'
        }}
      >
        {images.map((imageUrl, index) => (
          <motion.div
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            <img
              src={imageUrl}
              alt={`Page ${index + 1}`}
              loading="lazy"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-auto block select-none pointer-events-none"
              style={{
                transition: 'opacity 0.3s ease-out',
                maxWidth: '100%',
                height: 'auto',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            />
          </motion.div>
        ))}

        {/* End of Chapter - Comments */}
        <div className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Chapter Navigation */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#EDEDED]/10">
              {prevChapter ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChapterChange(prevChapter.id)}
                  className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all font-bold"
                >
                  ← {prevChapter.title}
                </motion.button>
              ) : (
                <div />
              )}

              {nextChapter ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChapterChange(nextChapter.id)}
                  className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all font-bold"
                >
                  {nextChapter.title} →
                </motion.button>
              ) : (
                <div />
              )}
            </div>

            {/* Comments Section */}
            <Giscus 
              term={`${manga.title} - Bölüm ${chapter.id}`}
              category="Bölümler"
            />
          </div>
        </div>
      </div>

      {/* Tap Zones Hint (First Load) */}
      <AnimatePresence>
        {showBar && scrollProgress < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="bg-[#EDEDED] px-6 py-3 rounded-full shadow-lg">
              <p className="text-sm text-[#0A0A0A] font-mono">
                Sol: Önceki | Orta: Menü | Sağ: Sonraki
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reader
