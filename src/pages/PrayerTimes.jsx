import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Segmented from '../components/Segmented'
import Icon from '../components/Icon'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import { calcDay, fmtTime, jumuah, PRAYERS } from '../lib/prayer'
import site from '../content/site.json'
import s from './PrayerTimes.module.css'

const pad = (n) => String(n).padStart(2, '0')
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Today() {
  const { list, next, countdown, progress, dateLabel, hijri } = usePrayerTimes()
  const [mode, setMode] = useState('athan')

  return (
    <section className={s.today} aria-label="Today">
      <div className="container">
        <div className={s.todayHead}>
          <div className={s.nextBlock}>
            <span className={s.kicker}>
              {dateLabel}
              {hijri && ` · ${hijri}`}
            </span>
            <p className={s.nextLine}>
              {next.name} in{' '}
              <span className={`${s.count} tabular`}>
                {countdown.h > 0 && `${countdown.h}:`}
                {pad(countdown.m)}:{pad(countdown.s)}
              </span>
            </p>
            <div className={s.track} aria-hidden="true">
              <div className={s.fill} style={{ transform: `scaleX(${progress})` }} />
            </div>
            <span className={s.nextMeta}>
              Athan {fmtTime(next.at)} · Iqama {fmtTime(next.iqama)}
            </span>
          </div>
          <Segmented
            id="mode"
            tone="dark"
            label="Show athan or iqama times"
            value={mode}
            onChange={setMode}
            options={[
              { id: 'athan', label: 'Athan' },
              { id: 'iqama', label: 'Iqama' },
            ]}
          />
        </div>

        <div className={s.cards}>
          {list.map((p, i) => {
            const main = p.noIqama || mode === 'athan' ? p.athan : p.iqama
            const sub = p.noIqama ? 'Sunrise, no prayer' : mode === 'athan' ? `Iqama ${fmtTime(p.iqama)}` : `Athan ${fmtTime(p.athan)}`
            return (
              <motion.div
                key={p.key}
                className={`${s.pCard} ${p.isNext ? s.pNext : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
              >
                <div className={s.pTop}>
                  <span className={s.pName}>{p.name}</span>
                  <span className={s.pAr} lang="ar">
                    {p.ar}
                  </span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mode + p.key}
                    className={`${s.pTime} tabular`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {fmtTime(main)}
                  </motion.span>
                </AnimatePresence>
                <span className={s.pSub}>{sub}</span>
                {p.isNext && <span className={s.pTag}>Next</span>}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Timetable() {
  const { today } = usePrayerTimesStatic()
  const [offset, setOffset] = useState(0)

  let vm = today.m + offset
  let vy = today.y
  while (vm > 12) {
    vm -= 12
    vy += 1
  }
  while (vm < 1) {
    vm += 12
    vy -= 1
  }

  const rows = useMemo(() => {
    const days = new Date(Date.UTC(vy, vm, 0)).getUTCDate()
    return Array.from({ length: days }, (_, i) => {
      const d = i + 1
      const t = calcDay(vy, vm, d)
      const wd = new Date(Date.UTC(vy, vm - 1, d)).getUTCDay()
      return { d, wd, t, isToday: vy === today.y && vm === today.m && d === today.d }
    })
  }, [vy, vm, today.y, today.m, today.d])

  const monthLabel = new Date(Date.UTC(vy, vm - 1, 15)).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })

  return (
    <section className="section container" aria-labelledby="timetable-title">
      <Reveal className="section-head">
        <div>
          <span className="eyebrow">Monthly timetable</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2 key={monthLabel} id="timetable-title" className="h2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {monthLabel}
            </motion.h2>
          </AnimatePresence>
        </div>
        <div className={s.monthNav}>
          <button type="button" className={s.round} onClick={() => setOffset((o) => o - 1)} aria-label="Previous month">
            <Icon name="chevronLeft" size={18} />
          </button>
          <button type="button" className={s.pill} onClick={() => setOffset(0)} disabled={offset === 0}>
            This month
          </button>
          <button type="button" className={s.round} onClick={() => setOffset((o) => o + 1)} aria-label="Next month">
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </Reveal>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <caption className="sr-only">Athan times for {monthLabel}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              {PRAYERS.map((p) => (
                <th key={p.key} scope="col">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.d} className={`${r.isToday ? s.rowToday : ''} ${r.wd === 5 ? s.rowFri : ''}`}>
                <th scope="row">
                  <span className={s.dCell}>
                    <span className={`${s.dNum} tabular`}>{r.d}</span>
                    <span className={s.dDay}>
                      {DAYS[r.wd]}
                      {r.wd === 5 && " · Jumu'ah"}
                      {r.isToday && ' · Today'}
                    </span>
                  </span>
                </th>
                {PRAYERS.map((p) => (
                  <td key={p.key} className={`tabular ${p.noIqama ? s.muted : ''}`}>
                    {fmtTime(r.t[p.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.note}>Athan times shown. Today is highlighted and Fridays are shaded.</p>
    </section>
  )
}

// The timetable only needs today's date, not a ticking clock.
function usePrayerTimesStatic() {
  const [today] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: site.location.timezone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(Date.now())
    const get = (t) => Number(parts.find((p) => p.type === t).value)
    return { y: get('year'), m: get('month'), d: get('day') }
  })
  return { today }
}

export default function PrayerTimes() {
  const off = site.prayer.iqamaOffsets
  return (
    <>
      <PageHero arabic="أَقِمِ الصَّلَاةَ لِذِكْرِي" title="Prayer Times" lead="“Establish prayer for My remembrance.” Surah Ta-Ha 20:14" ground="var(--night)" />
      <Today />

      <section className="container">
        <Reveal className={s.jumuah}>
          <div className={s.jText}>
            <span className={s.jKicker}>Every Friday</span>
            <h2 className={s.jTitle}>Jumu'ah Prayer</h2>
            <p className={s.jAr} lang="ar" dir="rtl">
              يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ
            </p>
            <p className={s.jEn}>“O you who have believed, when the call is made for prayer on Friday, hasten to the remembrance of Allah.” Surah Al-Jumu'ah 62:9</p>
          </div>
          <div className={s.jTimes}>
            <div className={s.jBox}>
              <span>Khutbah begins</span>
              <strong>{jumuah.khutbah}</strong>
            </div>
            <div className={`${s.jBox} ${s.jBoxLight}`}>
              <span>Iqama</span>
              <strong>{jumuah.iqama}</strong>
            </div>
          </div>
        </Reveal>
      </section>

      <Timetable />

      <section className="container" style={{ paddingBottom: 'clamp(64px, 9vw, 104px)' }}>
        <div className={s.info}>
          <Reveal className={s.infoCard}>
            <span className={s.infoIcon}>
              <Icon name="moon" />
            </span>
            <h3>Calculation method</h3>
            <p>
              Islamic Society of North America (ISNA), with Fajr and Isha at {site.prayer.fajrAngle}°. Calculated for Windham, NH at {site.location.lat.toFixed(2)}°N, {Math.abs(site.location.lng).toFixed(2)}°W.
            </p>
          </Reveal>
          <Reveal delay={0.06} className={s.infoCard}>
            <span className={s.infoIcon}>
              <Icon name="clock" />
            </span>
            <h3>Iqama policy</h3>
            <p>
              Iqama is {off.fajr} minutes after athan for Fajr, Dhuhr, Asr and Isha. Maghrib iqama is {off.maghrib} minutes after athan. Jumu'ah iqama is {jumuah.iqama}.
            </p>
          </Reveal>
          <Reveal delay={0.12} className={s.infoCard}>
            <span className={s.infoIcon}>
              <Icon name="shield" />
            </span>
            <h3>Always up to date</h3>
            <p>Times are calculated right here on the page every day, including daylight saving changes, so they never get stuck loading.</p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
