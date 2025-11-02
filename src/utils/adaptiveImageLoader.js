/**
 * Adaptive Image Loader with GPU-based Quality Enhancement
 * Dynamically adjusts image quality based on device capabilities
 */

import gpuDetector from './gpuDetection'

class AdaptiveImageLoader {
  constructor() {
    this.settings = null
    this.imageCache = new Map()
    this.prefetchQueue = []
    this.isProcessing = false
  }

  async init() {
    const score = await gpuDetector.init()
    this.settings = gpuDetector.getQualitySettings()
    console.log('Adaptive Image Loader initialized:', this.settings)
    return this.settings
  }

  /**
   * Load and optimize image based on GPU capabilities
   */
  async loadImage(src, options = {}) {
    if (!this.settings) await this.init()

    // Check cache first
    const cacheKey = `${src}_${this.settings.resolutionScale}`
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)
    }

    try {
      // Create optimized image
      const optimizedSrc = await this.optimizeImage(src, options)
      
      // Cache the result
      if (this.imageCache.size > this.settings.maxCacheSize) {
        // Remove oldest entries
        const firstKey = this.imageCache.keys().next().value
        this.imageCache.delete(firstKey)
      }
      this.imageCache.set(cacheKey, optimizedSrc)
      
      return optimizedSrc
    } catch (error) {
      console.error('Image optimization failed:', error)
      return src // Fallback to original
    }
  }

  /**
   * Optimize image based on GPU capabilities
   */
  async optimizeImage(src, options = {}) {
    // Düşük GPU'lar için optimizasyon yapma, orijinal görüntüyü kullan
    if (this.settings.resolutionScale === 1.0) {
      return src
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Calculate enhanced dimensions (only for powerful GPUs)
          const scale = this.settings.resolutionScale
          const targetWidth = img.width * scale
          const targetHeight = img.height * scale
          
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          // High quality smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Draw scaled image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          
          // Apply sharpening filter only for top-tier GPUs
          if (this.settings.enableSharpening && this.settings.score >= 5) {
            this.applySharpening(ctx, targetWidth, targetHeight)
          }
          
          // Keep original format and quality
          canvas.toBlob((blob) => {
            const optimizedUrl = URL.createObjectURL(blob)
            resolve(optimizedUrl)
          }, 'image/jpeg', 1.0) // Maksimum kalite
          
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = src
    })
  }

  /**
   * Apply sharpening filter for enhanced quality
   */
  applySharpening(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const factor = 0.5 // Sharpening intensity
    
    // Simple unsharp mask
    const weights = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    
    const side = Math.round(Math.sqrt(weights.length))
    const halfSide = Math.floor(side / 2)
    const output = new Uint8ClampedArray(data)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let value = 0
          
          for (let cy = 0; cy < side; cy++) {
            for (let cx = 0; cx < side; cx++) {
              const scy = y + cy - halfSide
              const scx = x + cx - halfSide
              
              if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                const srcOff = ((scy * width) + scx) * 4
                const wt = weights[cy * side + cx]
                value += data[srcOff + c] * wt * factor
              }
            }
          }
          
          const dstOff = ((y * width) + x) * 4
          output[dstOff + c] = data[dstOff + c] + value
        }
      }
    }
    
    ctx.putImageData(new ImageData(output, width, height), 0, 0)
  }

  /**
   * Prefetch next images for smooth reading
   */
  async prefetchImages(imageSrcs) {
    if (!this.settings) await this.init()
    
    const prefetchCount = Math.min(this.settings.prefetchCount, imageSrcs.length)
    
    for (let i = 0; i < prefetchCount; i++) {
      if (imageSrcs[i] && !this.imageCache.has(imageSrcs[i])) {
        this.prefetchQueue.push(imageSrcs[i])
      }
    }
    
    this.processPrefetchQueue()
  }

  async processPrefetchQueue() {
    if (this.isProcessing || this.prefetchQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.prefetchQueue.length > 0) {
      const src = this.prefetchQueue.shift()
      try {
        await this.loadImage(src, { priority: 'low' })
      } catch (error) {
        console.warn('Prefetch failed:', error)
      }
    }
    
    this.isProcessing = false
  }

  /**
   * Get adaptive loading settings for current device
   */
  getLoadingStrategy() {
    if (!this.settings) return { immediate: 1, lazy: 2 }
    
    return {
      immediate: Math.min(3, this.settings.score), // Load immediately
      lazy: this.settings.prefetchCount, // Lazy load count
      threshold: this.settings.lazyLoadDistance // Intersection observer threshold
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.imageCache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.imageCache.clear()
    this.prefetchQueue = []
  }
}

// Singleton instance
const adaptiveLoader = new AdaptiveImageLoader()

export default adaptiveLoader
