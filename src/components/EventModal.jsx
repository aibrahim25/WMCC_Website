import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { categoryLabel, dateLabel, eventLocation, gcalLink, timeRange } from '../lib/events'
import { DateBadge } from './EventCard'
import Icon from './Icon'
import s from './EventModal.module.css'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Keeps Tab / Shift+Tab focus inside `container`. */
function trapFocus(e, container) {
  const items = container?.querySelectorAll(FOCUSABLE)
  if (!items?.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

/**
 * Accessible event details dialog. Renders nothing when `ev` is null.
 * Locks page scroll, closes on Escape or backdrop click, traps focus and restores it on close.
 */
export default function EventModal({ ev, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!ev) return
    const prev = document.activeElement
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') trapFocus(e, dialogRef.current)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [ev, onClose])

  const cal = ev ? gcalLink(ev) : null
  const time = ev ? timeRange(ev) : ''

  return (
    <AnimatePresence>
      {ev && (
        <motion.div
          className={s.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-title"
            className={s.dialog}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className={s.head}>
              <DateBadge ev={ev} />
              <div className={s.headText}>
                <span className={s.cat}>{categoryLabel(ev.category)}</span>
                <h2 id="event-title" className={s.title}>
                  {ev.title}
                </h2>
              </div>
              <button ref={closeRef} type="button" className={s.close} onClick={onClose} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>

            <dl className={s.facts}>
              <div>
                <dt>
                  <Icon name="calendar" size={18} /> When
                </dt>
                <dd>
                  {ev.schedule}
                  {time && ` · ${time}`}
                  {ev.next && <span className={s.nextOn}>Next: {dateLabel(ev.next)}</span>}
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="pin" size={18} /> Where
                </dt>
                <dd>{eventLocation(ev)}</dd>
              </div>
              {ev.audience && (
                <div>
                  <dt>
                    <Icon name="users" size={18} /> Who
                  </dt>
                  <dd>{ev.audience}</dd>
                </div>
              )}
            </dl>

            <p className={s.desc}>{ev.description}</p>

            {ev.tags?.length > 0 && (
              <div className={s.tags}>
                {ev.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className={s.actions}>
              {ev.instagram && (
                <a href={ev.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Icon name="instagram" size={18} /> Follow on Instagram
                </a>
              )}
              {cal && (
                <a href={cal} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Icon name="calendar" size={18} /> Add to Google Calendar
                </a>
              )}
              {ev.link ? (
                <Link to={ev.link} className="btn btn-outline" onClick={onClose}>
                  Learn more
                </Link>
              ) : (
                <Link to="/contact" className="btn btn-outline" onClick={onClose}>
                  Ask a question
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
