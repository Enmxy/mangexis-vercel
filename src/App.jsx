import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import MangaDetail from './pages/MangaDetail'
import Reader from './pages/Reader'
import Discover from './pages/Discover'
import About from './pages/About'
import Disclaimer from './pages/Disclaimer'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Favorites from './pages/Favorites'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import MangaList from './pages/admin/MangaList'
import MangaForm from './pages/admin/MangaForm'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <HomePage />
          <Footer />
        </div>
      } />
      <Route path="/discover" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Discover />
          <Footer />
        </div>
      } />
      <Route path="/favorites" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Favorites />
          <Footer />
        </div>
      } />
      <Route path="/about" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <About />
          <Footer />
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
        </div>
      } />
      <Route path="/manga/:slug/chapter/:chapterId" element={<Reader />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mangas" element={<MangaList />} />
        <Route path="mangas/new" element={<MangaForm />} />
        <Route path="mangas/edit/:slug" element={<MangaForm />} />
      </Route>
    </Routes>
  )
}

export default App
