import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../utils/adminApi'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState(null)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const token = authApi.getToken()
      if (token) {
        try {
          const result = await authApi.verify(token)
          if (result.success) {
            // Redirect based on role
            if (result.user?.role === 'fansub') {
              navigate('/fansub')
            } else {
              navigate('/admin/dashboard')
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
        }
      }
    }
    checkAuth()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setWarning('')
    setLoading(true)

    try {
      const result = await authApi.login(username, password)
      
      if (result.success) {
        authApi.setToken(result.token)
        // Clear all warnings on success
        setRemainingAttempts(null)
        setLockedUntil(null)
        
        // Redirect based on role
        if (result.user?.role === 'fansub') {
          navigate('/fansub')
        } else {
          navigate('/admin/dashboard')
        }
      } else {
        // Handle different error types
        setError(result.error || 'Giriş başarısız')
        
        // Show remaining attempts warning
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts)
        }
        
        // Show lockout warning
        if (result.warning) {
          setWarning(result.warning)
        }
        
        // Handle lockout
        if (result.lockedUntil) {
          setLockedUntil(result.lockedUntil)
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
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

            {/* Lockout Warning */}
            {lockedUntil && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-red-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔒</span>
                  <span className="font-bold">Hesap Kilitlendi</span>
                </div>
                <p className="text-sm">Çok fazla başarısız deneme. 30 dakika sonra tekrar deneyin.</p>
              </motion.div>
            )}

            {/* Warning */}
            {warning && !lockedUntil && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-yellow-300 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{warning}</span>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && !lockedUntil && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <span className="text-xs bg-red-600/30 px-2 py-1 rounded">
                      {remainingAttempts} deneme kaldı
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={!lockedUntil ? { scale: 1.02 } : {}}
              whileTap={!lockedUntil ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading || lockedUntil}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lockedUntil ? '🔒 Hesap Kilitli' : loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </motion.button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-gray-400 text-xs text-center">
              🔐 JWT token ile güvenli giriş
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>🛡️ Rate limiting</span>
              <span>⏱️ Auto lockout</span>
              <span>📊 Security logging</span>
            </div>
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
