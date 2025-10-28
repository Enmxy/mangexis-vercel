import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Privacy = () => {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Gizlilik Politikası</h1>
            <div className="w-24 h-1.5 bg-white rounded-full mb-6"></div>
            <p className="text-gray-400">Son güncelleme: 28 Ekim 2025</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Toplanan Bilgiler</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MangeXis olarak, kullanıcı deneyimini geliştirmek için minimal düzeyde bilgi toplarız:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Okuma Geçmişi:</strong> Kaldığınız yerden devam edebilmeniz için localStorage kullanılır (cihazınızda saklanır).</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Çerezler:</strong> Site performansını ölçmek için temel çerezler kullanılır.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Analitik:</strong> Anonim kullanım istatistikleri toplanır.</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Bilgilerin Kullanımı</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Toplanan bilgiler yalnızca aşağıdaki amaçlarla kullanılır:
              </p>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Kullanıcı deneyimini kişiselleştirmek</li>
                <li>Site performansını iyileştirmek</li>
                <li>Teknik sorunları tespit etmek ve çözmek</li>
                <li>İçerik önerilerini optimize etmek</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. Bilgi Paylaşımı</h2>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-green-400 font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Kişisel bilgileriniz asla üçüncü taraflarla paylaşılmaz!
                </p>
              </div>
              <p className="text-gray-300 leading-relaxed">
                MangeXis, kullanıcı verilerini satmaz, kiralamaz veya üçüncü taraflarla paylaşmaz. Verileriniz yalnızca platformun işleyişi için kullanılır.
              </p>
            </section>

            {/* Section 4 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Veri Güvenliği</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Verilerinizin güvenliği bizim için önceliklidir:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-2">HTTPS Şifreleme</h3>
                  <p className="text-gray-400 text-sm">Tüm veri transferleri şifrelenir</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-2">Güvenli Hosting</h3>
                  <p className="text-gray-400 text-sm">Netlify güvenli altyapısı</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Kullanıcı Hakları</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Kullanıcılar olarak aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Verilerinize erişim hakkı</li>
                <li>• Verilerinizi silme hakkı</li>
                <li>• Veri işlemeyi reddetme hakkı</li>
                <li>• Şikayette bulunma hakkı</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. İletişim</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Gizlilik politikamız hakkında sorularınız için:
              </p>
              <div className="bg-white/5 border-l-4 border-white p-4 rounded">
                <p className="text-white font-medium">E-posta: privacy@mangexis.com</p>
              </div>
            </section>
          </div>

          {/* Back Button */}
          <div className="mt-12">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02, x: -5 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Anasayfaya Dön
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Privacy
