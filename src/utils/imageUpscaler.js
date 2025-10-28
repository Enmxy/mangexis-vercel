// Client-side image upscaling utility
// Uses canvas-based bicubic interpolation for real quality enhancement

export const upscaleImage = async (imageUrl, scaleFactor = 2) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { 
          alpha: false,
          desynchronized: true,
          willReadFrequently: false
        })
        
        // Original dimensions
        const originalWidth = img.width
        const originalHeight = img.height
        
        // Upscaled dimensions
        const newWidth = originalWidth * scaleFactor
        const newHeight = originalHeight * scaleFactor
        
        // Set canvas size to upscaled dimensions
        canvas.width = newWidth
        canvas.height = newHeight
        
        // Enable image smoothing with high quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw image at larger size (bicubic interpolation)
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
        
        // Apply sharpening filter
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight)
        const sharpened = sharpenImage(imageData)
        ctx.putImageData(sharpened, 0, 0)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          resolve(url)
        }, 'image/jpeg', 0.95)
        
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = reject
    img.src = imageUrl
  })
}

// Sharpening filter using convolution matrix
const sharpenImage = (imageData) => {
  const pixels = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  // Sharpening kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]
  
  const output = new ImageData(width, height)
  const outputPixels = output.data
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx
          const py = y + ky
          const idx = (py * width + px) * 4
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          const weight = kernel[kernelIdx]
          
          r += pixels[idx] * weight
          g += pixels[idx + 1] * weight
          b += pixels[idx + 2] * weight
        }
      }
      
      const outIdx = (y * width + x) * 4
      outputPixels[outIdx] = Math.min(255, Math.max(0, r))
      outputPixels[outIdx + 1] = Math.min(255, Math.max(0, g))
      outputPixels[outIdx + 2] = Math.min(255, Math.max(0, b))
      outputPixels[outIdx + 3] = 255
    }
  }
  
  return output
}

// Waifu2x-style upscaling (free API)
export const upscaleWithWaifu2x = async (imageUrl) => {
  try {
    // Using waifu2x.udp.jp free API
    const formData = new FormData()
    
    // Fetch image as blob
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    formData.append('file', blob)
    formData.append('style', 'art') // or 'photo'
    formData.append('noise', '3') // noise reduction level
    formData.append('scale', '2') // 2x upscale
    
    const apiResponse = await fetch('https://api.waifu2x.udp.jp/api', {
      method: 'POST',
      body: formData
    })
    
    if (!apiResponse.ok) {
      throw new Error('Waifu2x API failed')
    }
    
    const resultBlob = await apiResponse.blob()
    return URL.createObjectURL(resultBlob)
    
  } catch (error) {
    console.error('Waifu2x upscaling failed:', error)
    // Fallback to canvas upscaling
    return upscaleImage(imageUrl, 2)
  }
}

// Smart upscaling with caching
export class ImageUpscaler {
  constructor() {
    this.cache = new Map()
    this.processing = new Map()
  }
  
  async upscale(imageUrl, quality = 'ultra') {
    const cacheKey = `${imageUrl}-${quality}`
    
    // Return cached if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    // Wait if already processing
    if (this.processing.has(cacheKey)) {
      return this.processing.get(cacheKey)
    }
    
    // Start upscaling
    const promise = this.performUpscale(imageUrl, quality)
    this.processing.set(cacheKey, promise)
    
    try {
      const result = await promise
      this.cache.set(cacheKey, result)
      return result
    } finally {
      this.processing.delete(cacheKey)
    }
  }
  
  async performUpscale(imageUrl, quality) {
    switch (quality) {
      case 'ultra':
        // Try AI upscaling first, fallback to canvas
        try {
          return await upscaleWithWaifu2x(imageUrl)
        } catch {
          return await upscaleImage(imageUrl, 2)
        }
      
      case 'hd':
        return await upscaleImage(imageUrl, 1.5)
      
      case 'standard':
      default:
        return imageUrl
    }
  }
  
  clearCache() {
    this.cache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.cache.clear()
  }
}

export default new ImageUpscaler()
