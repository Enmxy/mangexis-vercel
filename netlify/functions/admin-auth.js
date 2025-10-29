const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'mangexis-super-secret-key-change-in-production'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mangexis2024'

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

    // Login
    if (action === 'login') {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign(
          { username, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            token,
            user: { username, role: 'admin' }
          })
        }
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid credentials' })
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: { username: decoded.username, role: decoded.role }
          })
        }
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid token' })
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
