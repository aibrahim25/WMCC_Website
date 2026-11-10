import { fullAddress, MAPS_URL, site } from '../lib/site'
import Icon from './Icon'
import s from './MapCard.module.css'

/** Illustrated map card linking to the masjid on Google Maps. */
export default function MapCard({ tall = false }) {
  return (
    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={`${s.map} ${tall ? s.tall : ''}`}>
      <svg className={s.art} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M-20 290 Q300 230 600 270 T1220 220" fill="none" stroke="#FFFFFF" strokeWidth="18" />
        <path d="M520 -20 Q560 150 600 270 T660 460" fill="none" stroke="#FFFFFF" strokeWidth="12" />
        <path d="M-20 100 Q400 140 820 80 T1220 70" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M900 440 Q940 330 1060 290" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M120 440 Q180 360 300 330" fill="none" stroke="#FFFFFF" strokeWidth="5" />
        <ellipse cx="260" cy="170" rx="90" ry="46" fill="#C9D3EE" opacity="0.7" />
        <circle className={s.pulse} cx="600" cy="270" r="40" fill="#E9A58E" />
        <path d="M600 280 C580 252 568 236 568 218 A32 32 0 0 1 632 218 C632 236 620 252 600 280 Z" fill="#24346B" />
        <circle cx="600" cy="218" r="11" fill="#F6C88E" />
      </svg>
      <div className={s.label}>
        <span className={s.name}>{site.name}</span>
        <span className={s.addr}>{fullAddress()}</span>
        <span className={s.cta}>
          Open in Google Maps <Icon name="arrow" size={16} />
        </span>
      </div>
    </a>
  )
}
