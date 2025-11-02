/**
 * GPU Detection and Performance Assessment
 * Detects GPU capabilities and provides performance score
 */

class GPUDetector {
  constructor() {
    this.gpuInfo = null
    this.performanceScore = 0
    this.initialized = false
  }

  async init() {
    if (this.initialized) return this.performanceScore

    try {
      // WebGL2 context for GPU detection
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) {
        console.warn('WebGL not supported')
        this.performanceScore = 1
        return this.performanceScore
      }

      // Get GPU info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        this.gpuInfo = { vendor, renderer }
        
        // Calculate performance score based on GPU
        this.performanceScore = this.calculateGPUScore(vendor, renderer)
      } else {
        // Fallback to basic detection
        this.performanceScore = await this.detectPerformanceLevel()
      }

      // Additional performance tests
      const additionalScore = await this.runPerformanceTest()
      this.performanceScore = Math.max(this.performanceScore, additionalScore)

      this.initialized = true
      console.log(`GPU Performance Score: ${this.performanceScore}/5`)
      
      return this.performanceScore
    } catch (error) {
      console.error('GPU detection error:', error)
      this.performanceScore = 2
      return this.performanceScore
    }
  }

  calculateGPUScore(vendor, renderer) {
    const gpuString = `${vendor} ${renderer}`.toLowerCase()
    
    // High-end GPUs (Score: 5)
    const highEndGPUs = ['rtx 40', 'rtx 30', 'rx 7900', 'rx 6900', 'a5000', 'a6000', 'm2 max', 'm3 pro', 'm3 max']
    if (highEndGPUs.some(gpu => gpuString.includes(gpu))) return 5
    
    // Mid-high GPUs (Score: 4)
    const midHighGPUs = ['rtx 20', 'gtx 1080', 'gtx 1070', 'rx 6800', 'rx 6700', 'rx 5700', 'm1 pro', 'm2 pro']
    if (midHighGPUs.some(gpu => gpuString.includes(gpu))) return 4
    
    // Mid-range GPUs (Score: 3)
    const midGPUs = ['gtx 16', 'gtx 1060', 'gtx 1050', 'rx 6600', 'rx 5600', 'rx 580', 'rx 570', 'm1', 'm2']
    if (midGPUs.some(gpu => gpuString.includes(gpu))) return 3
    
    // Low-mid GPUs (Score: 2)
    const lowMidGPUs = ['gtx 10', 'gtx 9', 'rx 5500', 'rx 560', 'rx 550', 'intel iris', 'intel xe']
    if (lowMidGPUs.some(gpu => gpuString.includes(gpu))) return 2
    
    // Integrated/Low-end (Score: 1)
    if (gpuString.includes('intel') || gpuString.includes('integrated')) return 1
    
    // Default mid-range for unknown
    return 3
  }

  async detectPerformanceLevel() {
    // Fallback performance detection using various browser APIs
    let score = 2
    
    // Check device memory (if available)
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory >= 8) score++
      if (navigator.deviceMemory >= 16) score++
    }
    
    // Check CPU cores
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency >= 8) score = Math.min(score + 1, 5)
      if (navigator.hardwareConcurrency >= 16) score = Math.min(score + 1, 5)
    }
    
    // Check connection speed (as a proxy for device capability)
    if (navigator.connection) {
      const connection = navigator.connection
      if (connection.effectiveType === '4g' && connection.downlink > 10) {
        score = Math.min(score + 0.5, 5)
      }
    }
    
    return Math.round(score)
  }

  async runPerformanceTest() {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      
      if (!ctx) return 2
      
      const iterations = 100
      const startTime = performance.now()
      
      // Perform intensive operations
      for (let i = 0; i < iterations; i++) {
        // Draw complex patterns
        ctx.fillStyle = `rgb(${i}, ${i}, ${i})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Apply filters
        ctx.filter = 'blur(2px)'
        ctx.drawImage(canvas, 0, 0)
        
        // Read pixels (expensive operation)
        ctx.getImageData(0, 0, 100, 100)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Score based on performance
      if (duration < 50) return 5
      if (duration < 100) return 4
      if (duration < 200) return 3
      if (duration < 400) return 2
      return 1
      
    } catch (error) {
      console.warn('Performance test failed:', error)
      return 2
    }
  }

  getQualitySettings() {
    const score = this.performanceScore
    
    return {
      // Image quality settings - always maintain base quality
      imageQuality: 1.0, // Kalite her zaman %100
      
      // Resolution multiplier - only enhance for powerful GPUs
      resolutionScale: score >= 5 ? 2.0 : score >= 4 ? 1.5 : score >= 3 ? 1.25 : 1.0,
      
      // Enable advanced features - only for powerful GPUs
      enableUpscaling: score >= 4, // Sadece güçlü GPU'larda
      enableSharpening: score >= 5, // Sadece en güçlü GPU'larda
      enableHDR: false, // Şimdilik kapalı
      
      // Prefetch settings - maintain smooth reading
      prefetchCount: score >= 5 ? 5 : score >= 4 ? 4 : score >= 3 ? 3 : 2,
      
      // Animation settings - basic animations for all
      enableSmoothScroll: true, // Herkes için
      enableTransitions: score >= 3, // Orta ve üstü için
      enableParallax: false, // Gereksiz, kapalı
      
      // Cache settings - reasonable for all
      maxCacheSize: score >= 5 ? 500 : score >= 4 ? 400 : score >= 3 ? 300 : 200, // MB
      
      // Loading strategy
      lazyLoadDistance: score >= 4 ? 3000 : score >= 3 ? 2000 : score >= 2 ? 1500 : 1000, // px
      
      // Performance score
      score
    }
  }
}

// Singleton instance
const gpuDetector = new GPUDetector()

export default gpuDetector
