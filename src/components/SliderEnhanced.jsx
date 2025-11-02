import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

const SliderEnhanced = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [imageLoaded, setImageLoaded] = useState({})
  const sliderRef = useRef(null)
  const progressRef = useRef(null)
  
  // Mouse parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5])
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5])

  // Auto-play with pause on hover
  useEffect(() => {
    if (!isPaused && !isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length)
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [slides.length, isPaused, isHovered])

  // Preload images
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new Image()
      img.src = slide.image
      img.onload = () => {
        setImageLoaded(prev => ({ ...prev, [index]: true }))
      }
    })
  }, [slides])

  const handleMouseMove = (e) => {
    const rect = sliderRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      mouseX.set(x)
      mouseY.set(y)
    }
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsPaused(true)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) nextSlide()
    if (isRightSwipe) prevSlide()
    
    setTouchStart(0)
    setTouchEnd(0)
    setIsPaused(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPaused(!isPaused)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused])

  const currentSlide = slides[currentIndex]
  const nextSlideIndex = (currentIndex + 1) % slides.length
  const prevSlideIndex = (currentIndex - 1 + slides.length) % slides.length

  return (
    <div className="relative w-full">
      {/* Main Slider Container */}
      <motion.div 
        ref={sliderRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl bg-black group"
        style={{
          perspective: 1000,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.2, x: 300 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -300 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="absolute inset-0"
            style={{
              rotateX: rotateX,
              rotateY: rotateY,
            }}
          >
            {/* Background Image with Ken Burns effect */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute inset-0"
            >
              {imageLoaded[currentIndex] ? (
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse" />
              )}
            </motion.div>
            
            {/* Multiple Gradient Overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-black/40" />
            
            {/* Content Container */}
            <Link to={currentSlide.link} className="absolute inset-0 flex items-end">
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="w-full p-6 sm:p-8 md:p-12 lg:p-16 pb-10 sm:pb-12 lg:pb-20"
              >
                <div className="max-w-4xl">
                  {/* Category Badge */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-wrap gap-2 mb-4"
                  >
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                      🔥 EN ÇOK OKUNAN
                    </span>
                    {currentSlide.genre && (
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-medium rounded-full">
                        {currentSlide.genre}
                      </span>
                    )}
                  </motion.div>

                  {/* Title with animation */}
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 leading-tight"
                    style={{
                      textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {currentSlide.title}
                  </motion.h1>

                  {/* Description */}
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl mb-6 max-w-3xl line-clamp-2 sm:line-clamp-3"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                  >
                    {currentSlide.description}
                  </motion.p>

                  {/* Meta Info */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex flex-wrap items-center gap-4 mb-6 text-white/80 text-xs sm:text-sm"
                  >
                    {currentSlide.chapters && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {currentSlide.chapters} Bölüm
                      </span>
                    )}
                    {currentSlide.rating && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        {currentSlide.rating}
                      </span>
                    )}
                    {currentSlide.views && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {currentSlide.views}K
                      </span>
                    )}
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="flex flex-wrap gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-bold rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-2xl hover:shadow-white/30 transition-all"
                    >
                      <span>Hemen Başla</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-xl text-sm sm:text-base border border-white/30 hover:bg-white/30 transition-all"
                    >
                      Detaylar
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </Link>

            {/* Play/Pause Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              onClick={(e) => {
                e.preventDefault()
                setIsPaused(!isPaused)
              }}
              className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
            >
              {isPaused ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all group"
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all group"
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Progress Bar with Auto-play indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <motion.div
            ref={progressRef}
            initial={{ width: 0 }}
            animate={{ width: isPaused ? `${(currentIndex / slides.length) * 100}%` : '100%' }}
            transition={{ duration: isPaused ? 0 : 6, ease: 'linear' }}
            onAnimationComplete={() => !isPaused && nextSlide()}
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
          />
        </div>

        {/* Enhanced Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`transition-all ${
                index === currentIndex 
                  ? 'w-12 h-2 bg-white' 
                  : 'w-8 h-2 bg-white/40 hover:bg-white/60'
              } rounded-full`}
            />
          ))}
        </div>
      </motion.div>

      {/* Thumbnail Navigation - Desktop Only */}
      <div className="hidden lg:flex gap-4 mt-6 px-4">
        {/* Previous Slide Preview */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={prevSlide}
          className="flex-1 cursor-pointer group"
        >
          <div className="relative h-32 rounded-lg overflow-hidden bg-gray-900">
            <img
              src={slides[prevSlideIndex].image}
              alt={slides[prevSlideIndex].title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
              <div>
                <p className="text-white/60 text-xs mb-1">← Önceki</p>
                <h4 className="text-white font-bold text-sm line-clamp-1">{slides[prevSlideIndex].title}</h4>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Slide Info */}
        <div className="flex-[2] bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Şu An İzliyorsunuz</p>
            <h3 className="text-white font-bold text-lg">{currentSlide.title}</h3>
            <p className="text-white/40 text-sm mt-1">{currentIndex + 1} / {slides.length}</p>
          </div>
        </div>

        {/* Next Slide Preview */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={nextSlide}
          className="flex-1 cursor-pointer group"
        >
          <div className="relative h-32 rounded-lg overflow-hidden bg-gray-900">
            <img
              src={slides[nextSlideIndex].image}
              alt={slides[nextSlideIndex].title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
              <div className="text-right w-full">
                <p className="text-white/60 text-xs mb-1">Sonraki →</p>
                <h4 className="text-white font-bold text-sm line-clamp-1">{slides[nextSlideIndex].title}</h4>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Thumbnail Grid */}
      <div className="lg:hidden grid grid-cols-3 gap-2 mt-4 px-2">
        {slides.map((slide, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => goToSlide(index)}
            className={`relative h-20 rounded-lg overflow-hidden ${
              index === currentIndex ? 'ring-2 ring-white' : ''
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover ${
                index === currentIndex ? 'opacity-100' : 'opacity-50'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
              <p className="text-white text-xs font-medium line-clamp-1">{slide.title}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default SliderEnhanced
