import { motion } from 'framer-motion'

const FeatureSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Hızlı Yükleme',
      description: 'Sayfa geçişleri anında, kesintisiz okuma deneyimi'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Mobil Uyumlu',
      description: 'Her cihazda mükemmel görünüm ve performans'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: 'HD Kalite',
      description: 'Yüksek çözünürlük, kristal netliğinde görüntü'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Günlük Güncelleme',
      description: 'Her gün yeni bölümler ve mangalar ekleniyor'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MangeXis</span>?
          </h2>
          <p className="text-gray-400 text-lg">Modern teknoloji ile kusursuz okuma deneyimi</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="relative group"
            >
              <div className="bg-gradient-to-br from-white to-gray-200 rounded-2xl p-6 h-full border border-gray-700/50 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-black rounded-xl w-16 h-16 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
