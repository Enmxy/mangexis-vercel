import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Initialize Netlify Identity
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', user => {
        setUser(user)
        if (user) {
          navigate('/admin/dashboard')
        }
      })

      window.netlifyIdentity.on('login', user => {
        setUser(user)
        navigate('/admin/dashboard')
        window.netlifyIdentity.close()
      })

      window.netlifyIdentity.on('logout', () => {
        setUser(null)
      })
    }
  }, [navigate])

  const handleLogin = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.open('login')
    } else {
      // Development mode - direkt dashboard'a yönlendir
      console.warn('Netlify Identity not available. Using development mode.')
      navigate('/admin/dashboard')
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/50"
          >
            Netlify Identity ile Giriş
          </motion.button>

          <p className="text-gray-400 text-xs text-center mt-6">
            Güvenli giriş için Netlify Identity kullanılmaktadır
          </p>
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
