import { useEffect } from 'react'
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PrayerTimes from './pages/PrayerTimes'
import Events from './pages/Events'
import School from './pages/School'
import Contact from './pages/Contact'
import Donate from './pages/Donate'
import NotFound from './pages/NotFound'
import { site } from './lib/site'

// The single-file preview build (`npm run build:preview`) has no server routing, so it keeps the URL in memory.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

const titled = (page) => `${page} · ${site.shortName}`

const ROUTES = [
  { path: '/', element: <Home />, title: site.name },
  { path: '/prayer-times', element: <PrayerTimes />, title: titled('Prayer Times') },
  { path: '/events', element: <Events />, title: titled('Events') },
  { path: '/school', element: <School />, title: titled('Sunday School') },
  { path: '/contact', element: <Contact />, title: titled('Contact') },
  { path: '/donate', element: <Donate />, title: titled('Donate') },
]
const NOT_FOUND_TITLE = titled('Page not found')

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] },
}

function Shell() {
  const location = useLocation()

  useEffect(() => {
    document.title = ROUTES.find((r) => r.path === location.pathname)?.title ?? NOT_FOUND_TITLE
  }, [location.pathname])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main id="main" key={location.pathname} {...pageTransition}>
          <Routes location={location}>
            {ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
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
