import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const Slider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const sliderRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
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
  }

  return (
    <div 
      ref={sliderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[300px] sm:h-[450px] lg:h-[600px] overflow-hidden rounded-lg sm:rounded-2xl shadow-2xl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Link to={slides[currentIndex].link}>
            <div className="relative w-full h-full group cursor-pointer">
              {/* Image with parallax effect */}
              <motion.img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              
              {/* Content */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute bottom-0 left-0 right-0 p-4 sm:p-10 lg:p-16"
              >
                <div className="max-w-3xl">
                  {/* Badge */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="inline-block mb-2 sm:mb-4"
                  >
                    <span className="px-2 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-[10px] sm:text-sm font-bold text-white">
                      ÖNE ÇIKAN
                    </span>
                  </motion.div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-4xl lg:text-6xl font-bold mb-2 sm:mb-6 text-white leading-tight line-clamp-2">
                    {slides[currentIndex].title}
                  </h2>

                  {/* Description - Hidden on mobile */}
                  {slides[currentIndex].description && (
                    <p className="hidden sm:block text-gray-300 text-sm sm:text-base lg:text-lg mb-6 line-clamp-2 max-w-2xl">
                      {slides[currentIndex].description}
                    </p>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <span className="px-4 sm:px-8 py-2 sm:py-4 text-xs sm:text-base bg-white text-black font-bold rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-2xl hover:shadow-white/30 flex items-center gap-2 inline-flex">
                      Şimdi Oku
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-200 group"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-200 group"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Enhanced Indicators */}
      <div className="absolute bottom-3 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8 sm:w-12' 
                : 'bg-white/40 hover:bg-white/60 w-4 sm:w-8'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default Slider
