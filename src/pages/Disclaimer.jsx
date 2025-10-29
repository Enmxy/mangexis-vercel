import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Disclaimer = () => {
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
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Yasal Açıklama</h1>
            <div className="w-24 h-1.5 bg-white rounded-full mb-6"></div>
            <p className="text-gray-400">Son güncelleme: 28 Ekim 2025</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Genel Bilgilendirme</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MangeXis, manga okuma platformudur. Bu platform üzerinden sunulan tüm içerikler bilgilendirme ve eğlence amaçlıdır.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Sitemizde yer alan mangalar, telif hakkı sahiplerinin izni ile veya yasal olarak paylaşılabilir içeriklerden oluşmaktadır.
              </p>
            </section>

            {/* Section 2 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Telif Hakları</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Tüm manga içerikleri, orijinal yaratıcılarına ve yayıncılarına aittir. MangeXis, bu içeriklerin telif haklarına saygı gösterir.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Eğer telif hakkınıza ait bir içerik bulunduğunu düşünüyorsanız, lütfen bizimle iletişime geçin. İlgili içerik derhal kaldırılacaktır.
              </p>
              <div className="bg-white/5 border-l-4 border-white p-4 rounded">
                <p className="text-white font-medium">Telif Hakları İçin İletişim: <a href="mailto:mangexis-destek@proton.me" className="text-purple-400 hover:text-purple-300 transition-colors">mangexis-destek@proton.me</a></p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. Kullanıcı Sorumluluğu</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Kullanıcılar, platformu yalnızca yasal amaçlarla kullanmalıdır.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>İçeriklerin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Kullanıcılar, platformu kullanarak bu şartları kabul etmiş sayılır.</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Sorumluluk Reddi</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MangeXis, kullanıcıların platform üzerinden eriştiği içeriklerden sorumlu değildir. Tüm içerikler "olduğu gibi" sunulmaktadır.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Platform, herhangi bir ön bildirimde bulunmaksızın içerikleri kaldırma, değiştirme veya güncelleme hakkını saklı tutar.
              </p>
            </section>

            {/* Section 5 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Değişiklikler</h2>
              <p className="text-gray-300 leading-relaxed">
                Bu yasal açıklama, gerektiğinde güncellenebilir. Değişiklikler bu sayfada yayınlandığı anda yürürlüğe girer. Kullanıcıların düzenli olarak bu sayfayı kontrol etmeleri önerilir.
              </p>
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

export default Disclaimer
