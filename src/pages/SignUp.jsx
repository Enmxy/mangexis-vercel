import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const SignUp = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tüm alanları doldurun')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      return
    }

    setLoading(true)

    const result = await register(formData.email, formData.password, formData.username)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Kayıt başarısız')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
          <p className="text-purple-400 text-sm">Hesap Oluştur</p>
        </div>

        {/* Sign Up Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Kayıt Ol
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Kullanıcı adınız"
                required
              />
            </div>

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
              <p className="text-gray-500 text-xs mt-1">En az 6 karakter</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
                required
              />
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
              {loading ? 'Kaydediliyor...' : '🚀 Kayıt Ol'}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-gray-500 text-xs text-center mt-6">
            Kayıt olarak{' '}
            <Link to="/terms" className="text-purple-400 hover:underline">
              Kullanım Koşulları
            </Link>
            {' '}ve{' '}
            <Link to="/privacy" className="text-purple-400 hover:underline">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
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

export default SignUp
