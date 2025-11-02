import { Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import InstallPWA from './components/InstallPWA'
import HomePage from './pages/HomePage'
import MangaDetail from './pages/MangaDetail'
import Reader from './pages/Reader'
import Discover from './pages/Discover'
import About from './pages/About'
import Disclaimer from './pages/Disclaimer'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Favorites from './pages/Favorites'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import ReadingHistory from './pages/ReadingHistory'
import CustomPage from './pages/CustomPage'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import FansubLayout from './components/admin/FansubLayout'
import Dashboard from './pages/admin/Dashboard'
import MangaList from './pages/admin/MangaList'
import MangaForm from './pages/admin/MangaForm'
import NewsList from './pages/admin/NewsList'
import NewsForm from './pages/admin/NewsForm'
import SliderList from './pages/admin/SliderList'
import SliderForm from './pages/admin/SliderForm'
import ChapterAdd from './pages/admin/ChapterAdd'
import ChapterEdit from './pages/admin/ChapterEdit'
import ChapterList from './pages/admin/ChapterList'
import PagesList from './pages/admin/PagesList'
import PageBuilder from './pages/admin/PageBuilder'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key')
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <InstallPWA />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <HomePage />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/discover" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Discover />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/favorites" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Favorites />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/history" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <ReadingHistory />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/about" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <About />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/disclaimer" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Disclaimer />
          <Footer />
        </div>
      } />
      <Route path="/privacy" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Privacy />
          <Footer />
        </div>
      } />
      <Route path="/terms" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Terms />
          <Footer />
        </div>
      } />
      <Route path="/manga/:slug" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <MangaDetail />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/manga/:slug/chapter/:chapterId" element={<Reader />} />
      <Route path="/news" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <News />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/news/:slug" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <NewsDetail />
          <Footer />
          <MobileBottomNav />
        </div>
      } />
      <Route path="/pages/:slug" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <CustomPage />
          <Footer />
          <MobileBottomNav />
        </div>
      } />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Fansub Routes - Chapter Management Only */}
      <Route path="/fansub" element={<FansubLayout />}>
        <Route index element={<ChapterAdd />} />
        <Route path="chapter-add" element={<ChapterAdd />} />
        <Route path="chapters" element={<ChapterList />} />
        <Route path="chapter-edit/:slug/:chapterId" element={<ChapterEdit />} />
      </Route>
      
      {/* Admin Routes - Full Access */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mangas" element={<MangaList />} />
        <Route path="mangas/new" element={<MangaForm />} />
        <Route path="mangas/edit/:slug" element={<MangaForm />} />
        <Route path="chapter-add" element={<ChapterAdd />} />
        <Route path="chapters" element={<ChapterList />} />
        <Route path="chapter-edit/:slug/:chapterId" element={<ChapterEdit />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/edit/:id" element={<NewsForm />} />
        <Route path="sliders" element={<SliderList />} />
        <Route path="sliders/new" element={<SliderForm />} />
        <Route path="sliders/edit/:id" element={<SliderForm />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/new" element={<PageBuilder />} />
        <Route path="pages/edit/:slug" element={<PageBuilder />} />
      </Route>
      </Routes>
    </ClerkProvider>
  )
}

export default App
