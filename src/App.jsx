import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import MangaDetail from './pages/MangaDetail'
import Reader from './pages/Reader'
import Discover from './pages/Discover'
import About from './pages/About'

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
        </div>
      } />
      <Route path="/discover" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Discover />
        </div>
      } />
      <Route path="/about" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <About />
        </div>
      } />
      <Route path="/manga/:slug" element={
        <div className="min-h-screen bg-black">
          <Navbar />
          <MangaDetail />
        </div>
      } />
      <Route path="/manga/:slug/chapter/:chapterId" element={<Reader />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mangas" element={<MangaList />} />
        <Route path="mangas/new" element={<MangaForm />} />
        <Route path="mangas/edit/:slug" element={<MangaForm />} />
      </Route>
    </Routes>
  )
}

export default App
