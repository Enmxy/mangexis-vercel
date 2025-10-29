// User Authentication Functions (Register, Login, Verify)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d' // 7 days

// In-memory user storage (for demo - use a real database in production)
// Structure: { email: { email, password, username, createdAt, favorites, history } }
let users = {}

// Load users from environment variable if exists (for persistence across deploys)
try {
  const storedUsers = process.env.USERS_DATA
  if (storedUsers) {
    users = JSON.parse(storedUsers)
  }
} catch (error) {
  console.error('Error loading users:', error)
}

// Helper: Save users (in production, save to database)
const saveUsers = () => {
  // In production, this would save to a database
  // For now, we just keep it in memory
  console.log('Users updated:', Object.keys(users).length)
}

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const path = event.path.replace('/.netlify/functions/user-auth', '')
  const method = event.httpMethod

  try {
    // REGISTER
    if (path === '/register' && method === 'POST') {
      const { email, password, username } = JSON.parse(event.body)

      // Validation
      if (!email || !password || !username) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Email, şifre ve kullanıcı adı gerekli' 
          })
        }
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Geçerli bir email adresi girin' 
          })
        }
      }

      // Password strength
      if (password.length < 6) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Şifre en az 6 karakter olmalı' 
          })
        }
      }

      // Check if user already exists
      if (users[email]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Bu email zaten kayıtlı' 
          })
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      users[email] = {
        email,
        password: hashedPassword,
        username,
        createdAt: Date.now(),
        favorites: [],
        readingHistory: []
      }

      saveUsers()

      // Generate token
      const token = jwt.sign(
        { email, username },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: {
            email,
            username,
            createdAt: users[email].createdAt
          }
        })
      }
    }

    // LOGIN
    if (path === '/login' && method === 'POST') {
      const { email, password } = JSON.parse(event.body)

      // Validation
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Email ve şifre gerekli' 
          })
        }
      }

      // Check if user exists
      const user = users[email]
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Email veya şifre hatalı' 
          })
        }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Email veya şifre hatalı' 
          })
        }
      }

      // Generate token
      const token = jwt.sign(
        { email, username: user.username },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: {
            email: user.email,
            username: user.username,
            createdAt: user.createdAt
          }
        })
      }
    }

    // VERIFY TOKEN
    if (path === '/verify' && method === 'POST') {
      const authHeader = event.headers.authorization || event.headers.Authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Token bulunamadı' 
          })
        }
      }

      const token = authHeader.substring(7)

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = users[decoded.email]

        if (!user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: 'Kullanıcı bulunamadı' 
            })
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              email: user.email,
              username: user.username,
              createdAt: user.createdAt
            }
          })
        }
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Geçersiz veya süresi dolmuş token' 
          })
        }
      }
    }

    // GET PROFILE
    if (path === '/profile' && method === 'GET') {
      const authHeader = event.headers.authorization || event.headers.Authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Token bulunamadı' 
          })
        }
      }

      const token = authHeader.substring(7)

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = users[decoded.email]

        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: 'Kullanıcı bulunamadı' 
            })
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              email: user.email,
              username: user.username,
              createdAt: user.createdAt,
              favorites: user.favorites || [],
              readingHistory: user.readingHistory || []
            }
          })
        }
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Geçersiz token' 
          })
        }
      }
    }

    // UPDATE PROFILE
    if (path === '/profile' && method === 'PUT') {
      const authHeader = event.headers.authorization || event.headers.Authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Token bulunamadı' 
          })
        }
      }

      const token = authHeader.substring(7)
      const { username, favorites, readingHistory } = JSON.parse(event.body)

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = users[decoded.email]

        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: 'Kullanıcı bulunamadı' 
            })
          }
        }

        // Update user data
        if (username) user.username = username
        if (favorites !== undefined) user.favorites = favorites
        if (readingHistory !== undefined) user.readingHistory = readingHistory

        saveUsers()

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              email: user.email,
              username: user.username,
              createdAt: user.createdAt
            }
          })
        }
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Geçersiz token' 
          })
        }
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint bulunamadı' })
    }

  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Sunucu hatası: ' + error.message 
      })
    }
  }
}
