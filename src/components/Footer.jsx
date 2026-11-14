import { Link } from 'react-router-dom'
import { fullAddress, site } from '../lib/site'
import Logo from './Logo'
import Icon from './Icon'
import FooterSky from './FooterSky'
import s from './Footer.module.css'

export default function Footer() {
  const { street, city, state } = site.address
  return (
      <footer className={s.footer}>
        <FooterSky />
      <div className="container">
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