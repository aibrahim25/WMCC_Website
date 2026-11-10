import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'
import Icon from './Icon'
import s from './Navbar.module.css'

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/prayer-times', label: 'Prayer Times' },
  { to: '/events', label: 'Events' },
  { to: '/school', label: 'Sunday School' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={`${s.bar} ${scrolled || open ? s.solid : ''}`}>
      <div className={`container ${s.inner}`}>
        <Link to="/" className={s.brand} aria-label="WMCC home">
          <Logo />
          <span className={s.brandText}>
            <strong>WMCC</strong>
            <small>Windham Muslim Community Center</small>
          </span>
        </Link>

        <nav className={s.links} aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <motion.span layoutId="nav-underline" className={s.underline} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={s.actions}>
          <Link to="/donate" className={`btn btn-gold ${s.donate}`}>
            <Icon name="heart" size={18} />
            Donate
          </Link>
          <button
            type="button"
            className={s.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className={s.mobile}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {NAV_LINKS.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i + 0.05 }}>
                <NavLink to={l.to} end={l.end} className={({ isActive }) => `${s.mLink} ${isActive ? s.mActive : ''}`}>
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
            <Link to="/donate" className="btn btn-gold">
              <Icon name="heart" size={18} />
              Donate
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
