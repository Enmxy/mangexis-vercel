import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Terms = () => {
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
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Kullanım Şartları</h1>
            <div className="w-24 h-1.5 bg-white rounded-full mb-6"></div>
            <p className="text-gray-400">Son güncelleme: 28 Ekim 2025</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Hizmet Kullanımı</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MangeXis platformunu kullanarak, aşağıdaki şartları kabul etmiş sayılırsınız:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Platformu yalnızca yasal amaçlarla kullanacaksınız.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>18 yaşından büyük olduğunuzu veya ebeveyn izniniz olduğunu onaylarsınız.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Platformun güvenliğini tehlikeye atacak eylemlerden kaçınacaksınız.</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Yasak Faaliyetler</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Aşağıdaki faaliyetler kesinlikle yasaktır:
              </p>
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    İçeriklerin izinsiz kopyalanması veya dağıtılması
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Platformu hack etmeye veya güvenlik açıklarını istismar etmeye çalışmak
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Ticari amaçlarla içerik kullanımı
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. İçerik Hakları</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Platform üzerindeki tüm içerikler telif hakkı ile korunmaktadır:
              </p>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Manga içerikleri orijinal yaratıcılarına aittir</li>
                <li>Platform tasarımı ve kodu MangeXis'e aittir</li>
                <li>İzinsiz kullanım yasal işlem gerektirebilir</li>
                <li>Telif ihlali bildirimleri derhal değerlendirilir</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Hesap Sorumluluğu</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Kullanıcılar, hesaplarının güvenliğinden sorumludur:
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <ul className="space-y-2 text-gray-300">
                  <li>• Hesap bilgilerinizi güvende tutun</li>
                  <li>• Şüpheli aktiviteleri bildirin</li>
                  <li>• Hesabınızdan yapılan tüm işlemlerden siz sorumlusunuz</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Hizmet Değişiklikleri</h2>
              <p className="text-gray-300 leading-relaxed">
                MangeXis, önceden haber vermeksizin hizmeti değiştirme, askıya alma veya sonlandırma hakkını saklı tutar. Platform "olduğu gibi" sunulmaktadır ve herhangi bir garanti verilmemektedir.
              </p>
            </section>

            {/* Section 6 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Sorumluluk Sınırlaması</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MangeXis, aşağıdaki durumlardan sorumlu tutulamaz:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Hizmet kesintileri veya hatalar</li>
                <li>• Veri kaybı</li>
                <li>• Üçüncü taraf içeriklerinden kaynaklanan sorunlar</li>
                <li>• Kullanıcıların platformu kullanımından doğan zararlar</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. Şartların Değiştirilmesi</h2>
              <p className="text-gray-300 leading-relaxed">
                Bu kullanım şartları zaman zaman güncellenebilir. Değişiklikler bu sayfada yayınlandığı anda yürürlüğe girer. Platformu kullanmaya devam ederek güncel şartları kabul etmiş sayılırsınız.
              </p>
            </section>

            {/* Section 8 */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">8. İletişim</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Kullanım şartları hakkında sorularınız için:
              </p>
              <div className="bg-white/5 border-l-4 border-white p-4 rounded">
                <p className="text-white font-medium">E-posta: legal@mangexis.com</p>
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

export default Terms
