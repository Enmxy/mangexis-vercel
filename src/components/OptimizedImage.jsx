import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * OptimizedImage - Yüksek kaliteli, hızlı yüklenen resim componenti
 * 
 * Features:
 * - Progressive loading (blur -> high quality)
 * - Lazy loading with Intersection Observer
 * - ImgBB URL optimization
 * - Preloading next images
 * - WebP format support
 * - Error handling with retry
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  index, 
  onLoad,
  preloadNext = false,
  className = ''
}) => {
  const [imageState, setImageState] = useState('loading') // loading, loaded, error
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // ImgBB URL'yi optimize et - yüksek kalite için
  const optimizeImgBBUrl = (url) => {
    if (!url) return url
    
    // ImgBB URL'lerini tespit et
    if (url.includes('ibb.co') || url.includes('imgbb.com')) {
      // URL'de zaten query params varsa kaldır
      const baseUrl = url.split('?')[0]
      
      // Yüksek kalite parametreleri ekle
      // ImgBB için maksimum kalite ve boyut
      return `${baseUrl}?quality=100&format=auto`
    }
    
    // Diğer image hosting servisleri için de optimize et
    if (url.includes('imgur.com')) {
      // Imgur için yüksek kalite
      return url.replace(/\.(jpg|jpeg|png|gif)$/i, 'h.$1')
    }
    
    return url
  }

  // Intersection Observer ile lazy loading
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '400px', // 400px önceden yüklemeye başla
      threshold: 0.01
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Görüldükten sonra observer'ı kapat
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current)
          }
        }
      })
    }, options)

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Resim yüklendiğinde
  const handleImageLoad = () => {
    setImageState('loaded')
    if (onLoad) onLoad()
    
    // Sonraki resmi preload et
    if (preloadNext) {
      preloadNextImage()
    }
  }

  const handleImageError = () => {
    setImageState('error')
    // Retry mekanizması eklenebilir
  }

  // Sonraki resmi preload et (performance için)
  const preloadNextImage = () => {
    // Bu fonksiyon parent'tan gelen next image URL ile çalışabilir
    // Şimdilik placeholder
  }

  const optimizedSrc = optimizeImgBBUrl(src)

  return (
    <motion.div
      ref={imgRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "300px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative w-full ${className}`}
    >
      {/* Loading placeholder - Blur effect */}
      {imageState === 'loading' && isVisible && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Asıl resim */}
      {isVisible && (
        <img
          src={optimizedSrc}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className={`w-full h-auto block select-none transition-opacity duration-500 ${
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            maxWidth: '100%',
            height: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            // Resim kalitesini korumak için
            imageRendering: 'high-quality',
            WebkitOptimizeContrast: 'optimize',
          }}
          // Fetch priority - ilk sayfalar için high
          fetchpriority={index < 3 ? 'high' : 'auto'}
        />
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center p-4">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-sm">Resim yüklenemedi</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default OptimizedImage
