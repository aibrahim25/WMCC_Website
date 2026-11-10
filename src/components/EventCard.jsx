import { motion } from 'framer-motion'
import { categoryLabel, MONTHS_SHORT, timeRange } from '../lib/events'
import Icon from './Icon'
import s from './EventCard.module.css'

/** Calendar-style badge showing the event's next date, or "Weekly"/"Ongoing" when it has none. */
export function DateBadge({ ev, className = '' }) {
  const r = ev.recurrence?.type
  return (
    <div className={`${s.badge} ${s['c_' + ev.category] || ''} ${className}`}>
      {ev.next ? (
        <>
          <span className={s.bMon}>{MONTHS_SHORT[ev.next.m - 1]}</span>
          <span className={s.bDay}>{ev.next.d}</span>
        </>
      ) : (
        <>
          <span className={s.bMon}>{r === 'weekly' ? 'Weekly' : 'Ongoing'}</span>
          <Icon name="calendar" size={26} />
        </>
      )}
    </div>
  )
}

/** Clickable event summary. `onOpen(ev)` opens the details dialog. */
export default function EventCard({ ev, onOpen }) {
  const time = timeRange(ev)
  return (
    <motion.article
      layout
      className={s.card}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
    >
      <button type="button" className={s.hit} onClick={() => onOpen(ev)} aria-label={`${ev.title}: details`}>
        <DateBadge ev={ev} />
        <div className={s.body}>
          <span className={s.cat}>{categoryLabel(ev.category)}</span>
          <h3 className={s.title}>{ev.title}</h3>
          <p className={s.when}>
            {ev.schedule}
            {time && ` · ${time}`}
          </p>
          {ev.audience && <p className={s.aud}>{ev.audience}</p>}
          <span className={s.more}>
            Details <Icon name="arrow" size={16} />
          </span>
        </div>
      </button>
    </motion.article>
  )
}
