import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Verify token
      fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'verify' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Redirect based on role
            if (data.user?.role === 'fansub') {
              navigate('/fansub')
            } else {
              navigate('/admin/dashboard')
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token')
        })
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      })
      
      const result = await response.json()

      
      if (result.success) {
        // Save token
        localStorage.setItem('admin_token', result.token)
        localStorage.setItem('admin_role', result.user.role)
        
        // Redirect based on role
        if (result.user.role === 'fansub') {
          navigate('/fansub')
        } else {
          navigate('/admin/dashboard')
        }
      } else {
        setError(result.error || 'Kullanıcı adı veya şifre hatalı')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('API bağlantı hatası. Vercel environment variables kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold font-mono text-white mb-2"
          >
            MangeXis
          </motion.h1>
          <p className="text-purple-400 text-sm tracking-widest">ADMIN PANEL</p>
        </div>

        {/* Login Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Giriş Yap
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              🔐 Vercel Serverless Functions + JWT Auth
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Admin: admin | Fansub: fansub
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center mt-8">
          © 2025 MangeXis. Tüm hakları saklıdır.
        </p>
      </motion.div>
    </div>
  )
}

export default AdminLogin
