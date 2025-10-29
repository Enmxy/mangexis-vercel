const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'mangexis-super-secret-key-change-in-production'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mangexis2024'

// Security Configuration
const MAX_LOGIN_ATTEMPTS = 5 // Max failed attempts before lockout
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes in ms
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours in ms

// In-memory storage (in production, use Redis or database)
const loginAttempts = new Map() // IP -> { count, firstAttempt, lockedUntil }
const rateLimitTracker = new Map() // IP -> { count, windowStart }
const securityLog = [] // Security event log

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
  
  // Keep only last 1000 entries
  if (securityLog.length > 1000) {
    securityLog.shift()
  }
}

// Get client IP
const getClientIP = (event) => {
  return event.headers['x-forwarded-for']?.split(',')[0] || 
         event.headers['x-real-ip'] || 
         'unknown'
}

// Rate limiting check
const checkRateLimit = (ip) => {
  const now = Date.now()
  const tracker = rateLimitTracker.get(ip)
  
  if (!tracker || now - tracker.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitTracker.set(ip, { count: 1, windowStart: now })
    return true
  }
  
  if (tracker.count >= MAX_REQUESTS_PER_WINDOW) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { count: tracker.count })
    return false
  }
  
  tracker.count++
  return true
}

// Check if IP is locked out
const isLockedOut = (ip) => {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return false
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true
  }
  
  // Reset if lockout expired
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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { username, password, action } = JSON.parse(event.body)
    const clientIP = getClientIP(event)

    // Login
    if (action === 'login') {
      // Rate limiting
      if (!checkRateLimit(clientIP)) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Too many requests. Please try again later.',
            retryAfter: 900 // 15 minutes in seconds
          })
        }
      }

      // Check if IP is locked out
      if (isLockedOut(clientIP)) {
        const attempts = loginAttempts.get(clientIP)
        const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000)
        
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
            lockedUntil: attempts.lockedUntil
          })
        }
      }

      // Validate credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        clearFailedAttempts(clientIP)
        
        const now = Date.now()
        const token = jwt.sign(
          { 
            username, 
            role: 'admin',
            iat: now,
            sessionStart: now
          },
          JWT_SECRET,
          { expiresIn: '2h' } // Shorter session for security
        )

        logSecurityEvent('LOGIN_SUCCESS', clientIP, { username })

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            token,
            user: { username, role: 'admin' },
            sessionTimeout: SESSION_TIMEOUT
          })
        }
      }

      // Failed login
      const attempts = recordFailedAttempt(clientIP)
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts.count

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid credentials',
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
          warning: remainingAttempts <= 2 ? `Warning: ${remainingAttempts} attempts remaining before lockout` : null
        })
      }
    }

    // Verify token
    if (action === 'verify') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'No token provided' })
        }
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        
        // Check session timeout
        const sessionAge = Date.now() - decoded.sessionStart
        if (sessionAge > SESSION_TIMEOUT) {
          logSecurityEvent('SESSION_TIMEOUT', clientIP, { username: decoded.username })
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: 'Session expired. Please login again.',
              reason: 'SESSION_TIMEOUT'
            })
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: { username: decoded.username, role: decoded.role },
            sessionAge,
            sessionRemaining: SESSION_TIMEOUT - sessionAge
          })
        }
      } catch (error) {
        logSecurityEvent('TOKEN_VALIDATION_FAILED', clientIP, { error: error.message })
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired token',
            reason: error.name
          })
        }
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}
