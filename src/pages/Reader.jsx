import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import Comments from '../components/Comments'

const Reader = () => {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBar, setShowBar] = useState(true)
  const [selectedFansub, setSelectedFansub] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
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

  // Save reading progress
  useEffect(() => {
    if (manga && chapter) {
      const key = `reading-progress-${manga.slug}`
      localStorage.setItem(key, JSON.stringify({
        chapterId: chapter.id,
        timestamp: Date.now()
      }))
    }
  }, [manga, chapter])

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

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)

      // Save scroll position
      const key = `scroll-position-${slug}-${chapterId}`
      localStorage.setItem(key, scrollTop.toString())
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug, chapterId])

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
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3">
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

                {/* Right: Settings */}
                <div className="flex items-center gap-2">
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
        className="max-w-4xl mx-auto pt-20"
        onClick={handleTap}
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
              className="w-full h-auto block"
              style={{
                filter: 'blur(0px)',
                transition: 'filter 0.3s ease-out'
              }}
              onLoad={(e) => {
                e.target.style.filter = 'blur(0px)'
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
            <Comments 
              identifier={`chapter-${manga.slug}-${chapterId}`}
              title={`${manga.title} - ${chapter.title}`}
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
