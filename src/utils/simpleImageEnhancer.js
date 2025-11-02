/**
 * Simple Image Enhancer - Lightweight quality improvement for all devices
 * No GPU detection, just basic enhancement that works everywhere
 */

class SimpleImageEnhancer {
  constructor() {
    this.cache = new Map()
    this.maxCacheSize = 50 // Limit cache to 50 images
  }

  /**
   * Enhance image with minimal performance impact
   */
  async enhanceImage(src) {
    // Check cache first
    if (this.cache.has(src)) {
      return this.cache.get(src)
    }

    try {
      const enhanced = await this.applyLightEnhancement(src)
      
      // Manage cache size
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value
        const oldUrl = this.cache.get(firstKey)
        if (oldUrl && oldUrl.startsWith('blob:')) {
          URL.revokeObjectURL(oldUrl)
        }
        this.cache.delete(firstKey)
      }
      
      this.cache.set(src, enhanced)
      return enhanced
      
    } catch (error) {
      console.warn('Enhancement failed, using original:', error)
      return src
    }
  }

  /**
   * Apply lightweight enhancement - works on all devices
   */
  async applyLightEnhancement(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d', { alpha: false })
          
          // Use original dimensions - no upscaling
          canvas.width = img.width
          canvas.height = img.height
          
          // High quality rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Draw image
          ctx.drawImage(img, 0, 0)
          
          // Apply subtle enhancement
          this.applySubtleEnhancement(ctx, canvas.width, canvas.height)
          
          // Convert to blob with high quality
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob))
            } else {
              resolve(src)
            }
          }, 'image/jpeg', 0.95)
          
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => resolve(src) // Fallback to original on error
      img.src = src
    })
  }

  /**
   * Apply subtle enhancement - minimal CPU usage
   */
  applySubtleEnhancement(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    // Subtle contrast and brightness adjustment
    const contrast = 1.05 // 5% contrast boost
    const brightness = 2   // Slight brightness increase
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply to RGB channels only
      data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness))     // R
      data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness)) // G
      data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness)) // B
      // Alpha channel (i + 3) remains unchanged
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Prefetch and enhance upcoming images
   */
  async prefetchImages(imageSrcs, count = 3) {
    const toEnhance = imageSrcs.slice(0, count)
    
    // Enhance in background without blocking
    toEnhance.forEach(src => {
      if (!this.cache.has(src)) {
        this.enhanceImage(src).catch(() => {}) // Silently fail
      }
    })
  }

  /**
   * Clear cache and free memory
   */
  clearCache() {
    this.cache.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.cache.clear()
  }
}

// Singleton instance
const imageEnhancer = new SimpleImageEnhancer()

export default imageEnhancer
