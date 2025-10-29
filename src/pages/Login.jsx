import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Email ve şifre gerekli')
      return
    }

    setLoading(true)

    const result = await login(formData.email, formData.password, formData.rememberMe)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Giriş başarısız')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-5xl font-bold font-mono text-white mb-2 cursor-pointer"
            >
              MangeXis
            </motion.h1>
          </Link>
          <p className="text-purple-400 text-sm">Hoş Geldin!</p>
        </div>

        {/* Login Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Giriş Yap
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="ornek@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Beni Hatırla</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                Şifremi Unuttum
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş Yapılıyor...' : '🔑 Giriş Yap'}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Hesabın yok mu?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                Kayıt Ol
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center">
              🔐 Güvenli JWT token ile giriş
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
