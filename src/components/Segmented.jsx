import { motion } from 'framer-motion'
import s from './Segmented.module.css'

/**
 * Pill-shaped single-choice switcher with a sliding highlight.
 *
 * @param {{ id: string, label: string }[]} options
 * @param {string} id Unique per page; keys the sliding highlight animation
 * @param {'light'|'dark'} tone Use 'dark' on night-sky backgrounds
 * @param {string} label Accessible name for the group
 */
export default function Segmented({ options, value, onChange, id, tone = 'light', label }) {
  return (
    <div className={`${s.wrap} ${tone === 'dark' ? s.dark : s.light}`} role="group" aria-label={label}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            className={`${s.btn} ${active ? s.active : ''}`}
            onClick={() => onChange(o.id)}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className={s.pill}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={s.label}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
