import { motion } from 'framer-motion'

const About = () => {
  const features = [
    {
      title: 'Premium Okuma Deneyimi',
      description: 'Tam ekran okuma modu, klavye kısayolları ve akıcı sayfa geçişleri ile kesintisiz manga okuma deneyimi.',
      icon: '📖'
    },
    {
      title: 'Minimalist Tasarım',
      description: 'Siyah-beyaz tema ile göz yormayan, modern ve elit bir arayüz. Her detay özenle tasarlandı.',
      icon: '🎨'
    },
    {
      title: 'Gelişmiş Filtreleme',
      description: 'Türe, duruma ve isme göre mangaları anında filtreleyin. Aradığınızı kolayca bulun.',
      icon: '🔍'
    },
    {
      title: 'Hızlı ve Güvenilir',
      description: 'Vite ile oluşturulmuş ultra hızlı performans. Sayfa yüklemeleri anlık.',
      icon: '⚡'
    }
  ]

  const team = [
    {
      role: 'Platform Mimarı',
      description: 'Aizen\'ın soğuk karizmasyyla tasarlandı'
    },
    {
      role: 'Kullanıcı Deneyimi',
      description: 'Sessiz ama şiddetli hover efektleri'
    },
    {
      role: 'Teknoloji',
      description: 'React, Vite, Tailwind, Framer Motion'
    }
  ]

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-shadow-glow">
            MangeXis
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-tertiary max-w-3xl mx-auto leading-relaxed px-4">
            Premium manga okuma platformu. Minimalist tasarım, maksimum deneyim.
            Kalite &gt; Hız. Sessiz ama güçlü.
          </p>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="glass-effect border border-white/10 rounded-lg p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Tasarım Felsefemiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Soğuk Güven</h3>
                <p className="text-sm sm:text-base text-tertiary">Gereksiz süslemeler yok. Her element bir amaca hizmet eder.</p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Elite Minimalizm</h3>
                <p className="text-sm sm:text-base text-tertiary">Sade ama güçlü. Sessiz ama şiddetli.</p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Keskin Hassasiyet</h3>
                <p className="text-sm sm:text-base text-tertiary">Temiz kenarlıklar, mükemmel boşluklar, akıcı animasyonlar.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center">Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="glass-effect border border-white/10 rounded-lg p-6 sm:p-8 hover:border-white/30 transition-all duration-200"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-tertiary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center">Teknoloji Yığını</h2>
          <div className="glass-effect border border-white/10 rounded-lg p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6 text-center">
              {['React 18', 'Vite', 'Tailwind CSS', 'Framer Motion', 'React Router'].map((tech) => (
                <motion.div
                  key={tech}
                  whileHover={{ scale: 1.05 }}
                  className="py-3 sm:py-4 px-4 sm:px-6 bg-white/5 rounded-custom border border-white/10 hover:border-white/30 transition-all duration-200"
                >
                  <p className="text-sm sm:text-base font-medium">{tech}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">Değerlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {team.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="glass-effect border border-white/10 rounded-lg p-4 sm:p-6 hover:border-white/30 transition-all duration-200"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2">{item.role}</h3>
                <p className="text-sm text-tertiary">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-lg sm:text-xl lg:text-2xl font-light text-tertiary italic px-4">
            "Ben kaliteliyim, ama bağırmıyorum."
          </p>
          <p className="text-xs sm:text-sm text-tertiary mt-4">— EnmPoy, MangeXis Kurucusu</p>
        </motion.div>
      </div>
    </div>
  )
}

export default About
