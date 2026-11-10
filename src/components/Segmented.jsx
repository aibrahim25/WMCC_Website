import { motion } from 'framer-motion'
import s from './Segmented.module.css'

// Pill switcher with a sliding highlight. tone: 'dark' (on night backgrounds) or 'light'.
export default function Segmented({ options, value, onChange, id, tone = 'light', label }) {
  return (
    <div className={`${s.wrap} ${tone === 'dark' ? s.dark : s.light}`} role="tablist" aria-label={label}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${s.btn} ${active ? s.active : ''}`}
            onClick={() => onChange(o.id)}
          >
            {active && <motion.span layoutId={`seg-${id}`} className={s.pill} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className={s.label}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
