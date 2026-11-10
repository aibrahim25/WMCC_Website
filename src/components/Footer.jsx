import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fullAddress, site } from '../lib/site'
import { isEmail } from '../lib/format'
import { useSubmit } from '../hooks/useSubmit'
import Logo from './Logo'
import Icon from './Icon'
import s from './Footer.module.css'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { status, submit } = useSubmit(site.integrations.newsletterFormspreeId)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isEmail(email)) {
      setError('Enter an email address like name@example.com')
      return
    }
    setError('')
    await submit({ email, _subject: 'Newsletter signup' })
  }

  if (status === 'sent') {
    return (
      <p className={s.done}>
        <Icon name="check" size={20} /> You're on the list. JazakAllahu khair!
      </p>
    )
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email" className={s.formLabel}>
        Email address
      </label>
      <div className={s.formRow}>
        <input
          id="newsletter-email"
          type="email"
          className={s.input}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'newsletter-error' : undefined}
        />
        <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
          {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {error && (
        <span id="newsletter-error" className={s.error} role="alert">
          {error}
        </span>
      )}
      {status === 'error' && (
        <span className={s.error} role="alert">
          That didn't go through. Please try again in a minute.
        </span>
      )}
    </form>
  )
}

export default function Footer() {
  const { street, city, state } = site.address
  return (
    <footer className={s.footer}>
      <div className="container">
        <div className={s.top}>
          <div className={s.signup}>
            <h2 className={s.h}>Stay in the loop</h2>
            <p className={s.p}>Eid times, school closures and events, straight to your inbox.</p>
          </div>
          <Newsletter />
        </div>

        <div className={s.grid}>
          <div className={s.about}>
            <Link to="/" className={s.brand}>
              <Logo size={36} />
              <span>WMCC</span>
            </Link>
            <p>
              Serving Muslims in Londonderry, Windham and the surrounding towns through worship, learning and service.
            </p>
            <div className={s.social}>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="WMCC on Instagram">
                <Icon name="instagram" size={20} />
              </a>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="WMCC on Facebook">
                <Icon name="facebook" size={20} />
              </a>
            </div>
          </div>
          <nav className={s.col} aria-label="Visit">
            <span className={s.colH}>Visit</span>
            <Link to="/prayer-times">Prayer Times</Link>
            <Link to="/events">Events</Link>
            <Link to="/school">Sunday School</Link>
          </nav>
          <nav className={s.col} aria-label="Get involved">
            <span className={s.colH}>Get involved</span>
            <Link to="/events">Youth Program</Link>
            <Link to="/contact">Volunteer</Link>
            <Link to="/donate">Donate</Link>
          </nav>
          <div className={s.col}>
            <span className={s.colH}>Contact</span>
            <span>
              {street}, {city}, {state}
            </span>
            <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>

        <div className={s.legal}>
          <span>
            © {new Date().getFullYear()} {site.name} · 501(c)(3) nonprofit · EIN {site.ein}
          </span>
          <span>{fullAddress()}</span>
        </div>
      </div>
    </footer>
  )
}
