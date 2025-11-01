import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { isBot, checkRateLimit, addSecurityHeaders } from './_rateLimit.js'

// CRITICAL SECURITY: All credentials MUST be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'mangexis-fallback-secret-CHANGE-IN-PRODUCTION'

// Warn if using fallback secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using fallback JWT_SECRET. Set JWT_SECRET in environment variables for production!')
}

// Fallback hashed passwords for development (ONLY if env vars not set)
// Admin: 134790Emre2012/8
const FALLBACK_ADMIN_HASH = '$2a$12$AEBfqB557jswA/1v70Y2I.bqdRaRvEolU4.ZdOcItffHXG.b.0Uwu'
// Fansub: Mangexis/Fansub2025OP
const FALLBACK_FANSUB_HASH = '$2a$12$4xZ9TjhysyZhqNP2Fn4jNeFoUh2Mzu.XCA5KRbN5wQ1BpNoGvXm4C'

const USERS = [
  {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || FALLBACK_ADMIN_HASH,
    role: 'admin'
  },
  {
    username: process.env.FANSUB_USERNAME || 'fansub',
    passwordHash: process.env.FANSUB_PASSWORD_HASH || FALLBACK_FANSUB_HASH,
    role: 'fansub'
  }
]

// Warn if using fallback credentials
if (!process.env.ADMIN_PASSWORD_HASH || !process.env.FANSUB_PASSWORD_HASH) {
  console.warn('⚠️  WARNING: Using fallback password hashes. Set environment variables for production!')
}

// IP-based authentication (comma-separated list in env)
const getAllowedIPs = () => {
  const ips = process.env.ALLOWED_ADMIN_IPS || ''
  return ips.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0)
}

// Security Configuration
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours

// In-memory storage (in production, use Redis or database)
const loginAttempts = new Map()
const rateLimitTracker = new Map()
const securityLog = []

// Security logging
const logSecurityEvent = (event, ip, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip,
    ...details
  }
  securityLog.push(logEntry)
  console.log('[SECURITY]', JSON.stringify(logEntry))
  
  if (securityLog.length > 1000) {
    securityLog.shift()
  }
}

// Get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress ||
         'unknown'
}

// Note: Using shared checkRateLimit from _rateLimit.js for consistency

// Check if IP is locked out
const isLockedOut = (ip) => {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return false
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true
  }
  
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    loginAttempts.delete(ip)
    return false
  }
  
  return false
}

// Record failed login attempt
const recordFailedAttempt = (ip) => {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: now }
  
  attempts.count++
  attempts.lastAttempt = now
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_DURATION
    logSecurityEvent('ACCOUNT_LOCKED', ip, { 
      attempts: attempts.count,
      lockedUntil: new Date(attempts.lockedUntil).toISOString()
    })
  } else {
    logSecurityEvent('FAILED_LOGIN', ip, { attempts: attempts.count })
  }
  
  loginAttempts.set(ip, attempts)
  return attempts
}

// Clear failed attempts on successful login
const clearFailedAttempts = (ip) => {
  loginAttempts.delete(ip)
}

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Bot protection
  const userAgent = req.headers['user-agent'] || ''
  if (isBot(userAgent)) {
    console.log('🚫 Bot blocked on admin-auth:', userAgent)
    return res.status(403).json({ success: false, error: 'Automated access is not allowed' })
  }

  // Rate limiting (using shared rate limiter)
  const clientIP = getClientIP(req)
  const rateLimit = checkRateLimit(clientIP, userAgent)
  
  if (!rateLimit.allowed) {
    console.log('⚠️ Rate limit exceeded on admin-auth:', clientIP)
    res.setHeader('Retry-After', rateLimit.retryAfter)
    return res.status(429).json({ 
      success: false, 
      error: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password, action } = req.body
    const clientIP = getClientIP(req)

    // IP-based auto login
    if (action === 'check-ip') {
      const allowedIPs = getAllowedIPs()
      
      if (allowedIPs.includes(clientIP)) {
        // IP is allowed - create admin token
        const now = Date.now()
        const token = jwt.sign(
          { 
            username: 'admin-ip',
            role: 'admin',
            ip: clientIP,
            iat: now,
            sessionStart: now
          },
          JWT_SECRET,
          { expiresIn: '2h' }
        )

        logSecurityEvent('IP_AUTO_LOGIN', clientIP, { allowed: true })

        return res.status(200).json({
          success: true,
          token,
          user: { username: 'admin-ip', role: 'admin' },
          sessionTimeout: SESSION_TIMEOUT,
          method: 'ip'
        })
      }

      // IP not in allowed list
      return res.status(200).json({
        success: false,
        message: 'IP not allowed',
        requiresLogin: true
      })
    }

    // Login
    if (action === 'login') {
      // Rate limiting
      if (!checkRateLimit(clientIP)) {
        return res.status(429).json({ 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: 900
        })
      }

      // Check if IP is locked out
      if (isLockedOut(clientIP)) {
        const attempts = loginAttempts.get(clientIP)
        const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000)
        
        return res.status(403).json({ 
          success: false, 
          error: `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
          lockedUntil: attempts.lockedUntil
        })
      }

      // Find user by username
      const user = USERS.find(u => u.username === username)
      
      // Validate password with bcrypt
      let isValidPassword = false
      if (user && user.passwordHash) {
        isValidPassword = await bcrypt.compare(password, user.passwordHash)
      }
      
      if (user && isValidPassword) {
        clearFailedAttempts(clientIP)
        
        const now = Date.now()
        const token = jwt.sign(
          { 
            username: user.username, 
            role: user.role,
            iat: now,
            sessionStart: now
          },
          JWT_SECRET,
          { expiresIn: '2h' }
        )

        logSecurityEvent('LOGIN_SUCCESS', clientIP, { username: user.username, role: user.role })

        return res.status(200).json({
          success: true,
          token,
          user: { username: user.username, role: user.role },
          sessionTimeout: SESSION_TIMEOUT
        })
      }

      // Failed login
      const attempts = recordFailedAttempt(clientIP)
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts.count

      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials',
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
        warning: remainingAttempts <= 2 ? `Warning: ${remainingAttempts} attempts remaining before lockout` : null
      })
    }

    // Verify token
    if (action === 'verify') {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' })
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        
        // Check session timeout
        const sessionAge = Date.now() - decoded.sessionStart
        if (sessionAge > SESSION_TIMEOUT) {
          logSecurityEvent('SESSION_TIMEOUT', clientIP, { username: decoded.username })
          return res.status(401).json({ 
            success: false, 
            error: 'Session expired. Please login again.',
            reason: 'SESSION_TIMEOUT'
          })
        }

        return res.status(200).json({
          success: true,
          user: { username: decoded.username, role: decoded.role },
          sessionAge,
          sessionRemaining: SESSION_TIMEOUT - sessionAge
        })
      } catch (error) {
        logSecurityEvent('TOKEN_VALIDATION_FAILED', clientIP, { error: error.message })
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token',
          reason: error.name
        })
      }
    }

    return res.status(400).json({ error: 'Invalid action' })

  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({ error: 'Server error', details: error.message })
  }
}
