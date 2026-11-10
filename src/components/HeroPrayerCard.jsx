import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import { fmtTime, jumuah } from '../lib/prayer'
import Icon from './Icon'
import s from './HeroPrayerCard.module.css'

const pad = (n) => String(n).padStart(2, '0')

export default function HeroPrayerCard() {
  const { list, next, countdown, progress, dateLabel, hijri } = usePrayerTimes()

  return (
    <motion.aside
      className={s.card}
      aria-label="Today's prayer times"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className={s.top}>
        <span className={s.label}>Next prayer</span>
        <span className={s.date}>{dateLabel}</span>
      </div>
      <div className={s.nextRow}>
        <div>
          <p className={s.nextName}>{next.name}</p>
          <p className={s.nextMeta}>
            Athan {fmtTime(next.at)} · Iqama {fmtTime(next.iqama)}
          </p>
        </div>
        <p className={`${s.count} tabular`} aria-live="off">
          {countdown.h > 0 && (
            <>
              {countdown.h}
              <span>h</span>{' '}
            </>
          )}
          {pad(countdown.m)}
          <span>m</span> {pad(countdown.s)}
          <span>s</span>
        </p>
      </div>
      <div className={s.track} aria-hidden="true">
        <div className={s.fill} style={{ transform: `scaleX(${progress})` }} />
      </div>

      <ul className={s.list}>
        {list.map((p) => (
          <li key={p.key} className={`${s.row} ${p.isNext ? s.rowNext : ''} ${p.noIqama ? s.rowMuted : ''}`}>
            <span className={s.pName}>
              {p.name}
              <span className={s.pAr} lang="ar">
                {p.ar}
              </span>
            </span>
            <span className="tabular">{fmtTime(p.athan)}</span>
            <span className={`${s.iq} tabular`}>{p.iqama ? fmtTime(p.iqama) : '·'}</span>
          </li>
        ))}
      </ul>

      <div className={s.foot}>
        <span>
          <strong>Jumu'ah</strong> {jumuah.khutbah} · Iqama {jumuah.iqama}
        </span>
        {hijri && <span className={s.hijri}>{hijri}</span>}
      </div>
      <Link to="/prayer-times" className={s.more}>
        Full monthly timetable <Icon name="arrow" size={16} />
      </Link>
    </motion.aside>
  )
}
