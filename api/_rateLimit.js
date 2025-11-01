// Rate Limiting & Bot Protection Utility for Vercel Serverless Functions
const rateLimitMap = new Map()

const BOT_USER_AGENTS = [
  'httrack',
  'wget',
  'curl',
  'scrapy',
  'python-requests',
  'go-http-client',
  'bot',
  'crawler',
  'spider',
  'scraper',
  'download',
  'archiver',
  'offline browser',
  'site copier',
  'teleport',
  'webcopier',
  'webzip',
  'getright',
  'massdownloader'
]

const RATE_LIMIT_CONFIG = {
  windowMs: 10000, // 10 seconds
  maxRequests: 30,
  blockDuration: 60000 // 1 minute
}

export function isBot(userAgent) {
  if (!userAgent) return true
  const ua = userAgent.toLowerCase()
  return BOT_USER_AGENTS.some(bot => ua.includes(bot))
}

export function checkRateLimit(ip, userAgent = '') {
  const now = Date.now()
  const key = `${ip}-${userAgent.substring(0, 50)}`
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, {
      count: 1,
      firstRequest: now,
      blockedUntil: null
    })
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.maxRequests - 1 }
  }
  
  const userData = rateLimitMap.get(key)
  
  // Check if currently blocked
  if (userData.blockedUntil && now < userData.blockedUntil) {
    return {
      allowed: false,
      blocked: true,
      retryAfter: Math.ceil((userData.blockedUntil - now) / 1000),
      message: 'Too many requests. Please slow down.'
    }
  }
  
  // Reset window if expired
  if (now - userData.firstRequest > RATE_LIMIT_CONFIG.windowMs) {
    userData.count = 1
    userData.firstRequest = now
    userData.blockedUntil = null
  } else {
    userData.count++
  }
  
  // Block if exceeded
  if (userData.count > RATE_LIMIT_CONFIG.maxRequests) {
    userData.blockedUntil = now + RATE_LIMIT_CONFIG.blockDuration
    return {
      allowed: false,
      blocked: true,
      retryAfter: Math.ceil(RATE_LIMIT_CONFIG.blockDuration / 1000),
      message: 'Rate limit exceeded'
    }
  }
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - userData.count
  }
}

// Cleanup old entries periodically
export function cleanupRateLimitMap() {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_CONFIG.blockDuration * 2
  
  for (const [key, data] of rateLimitMap.entries()) {
    if (data.firstRequest < cutoff && (!data.blockedUntil || data.blockedUntil < now)) {
      rateLimitMap.delete(key)
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitMap, 60000)
}

export function addSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'SAMEORIGIN')
  response.setHeader('X-XSS-Protection', '1; mode=block')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader('X-Powered-By', 'MangeXis')
}
