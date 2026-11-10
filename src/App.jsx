import { BrowserRouter, MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PrayerTimes from './pages/PrayerTimes'
import Events from './pages/Events'
import School from './pages/School'
import Contact from './pages/Contact'
import Donate from './pages/Donate'
import NotFound from './pages/NotFound'

// The preview build uses an in-memory router so it works inside a single HTML file.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

const TITLES = {
  '/': 'Windham Muslim Community Center',
  '/prayer-times': 'Prayer Times · WMCC',
  '/events': 'Events · WMCC',
  '/school': 'Sunday School · WMCC',
  '/contact': 'Contact · WMCC',
  '/donate': 'Donate · WMCC',
}

function Shell() {
  const location = useLocation()

  useEffect(() => {
    document.title = TITLES[location.pathname] || 'Page not found · WMCC'
  }, [location.pathname])

  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <Navbar />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/prayer-times" element={<PrayerTimes />} />
            <Route path="/events" element={<Events />} />
            <Route path="/school" element={<School />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <MotionConfig reducedMotion="user">
        <Shell />
      </MotionConfig>
    </Router>
  )
}
