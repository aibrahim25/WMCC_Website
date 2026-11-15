import calendar from '../content/schoolCalendar.json'
import { isoDate, partsInTz } from '../lib/prayer'
import Icon from './Icon'
import Reveal from './Reveal'
import s from './SchoolCalendar.module.css'

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })

const toDate = (iso) => new Date(`${iso}T00:00:00Z`)

function groupByMonth(days) {
  const months = new Map()
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = day.date.slice(0, 7)
    if (!months.has(key)) months.set(key, { key, label: MONTH.format(toDate(day.date)), days: [] })
    months.get(key).days.push(day)
  }
  return [...months.values()]
}

const MONTHS = groupByMonth(calendar.days)

function TypeDot({ type }) {
  return <span className={`${s.dot} ${s[type]}`} aria-hidden="true" />
}

export default function SchoolCalendar() {
  const today = isoDate(partsInTz(Date.now()))
  const next = MONTHS.flatMap((m) => m.days).find((day) => day.date >= today)

  return (
    <section id="calendar" className="section container" aria-labelledby="calendar-title">
      <Reveal className="section-head">
        <div>
          <span className="eyebrow">Yearly calendar</span>
          <h2 id="calendar-title" className="h2">
            {calendar.title}
          </h2>
        </div>
        <ul className={s.legend} aria-label="Key">
          {Object.entries(calendar.types).map(([type, label]) => (
            <li key={type}>
              <TypeDot type={type} /> {label}
            </li>
          ))}
          <li>
            <Icon name="moon" size={15} className={s.moonIcon} /> Ramadan / Eid
          </li>
        </ul>
      </Reveal>

      {next && (
        <Reveal className={`${s.next} ${s[next.type]}`}>
          <span className={s.nextLabel}>{next.date === today ? 'Today' : 'Coming up'}</span>
          <strong className={s.nextTitle}>{next.title}</strong>
          <span className={s.nextDate}>{LONG_DATE.format(toDate(next.date))}</span>
        </Reveal>
      )}

      <div className={s.months}>
        {MONTHS.map((month, i) => (
          <Reveal key={month.key} delay={(i % 3) * 0.05} as="article" className={s.month}>
            <h3 className={s.monthTitle}>{month.label}</h3>
            <ol className={s.days}>
              {month.days.map((day) => {
                const date = toDate(day.date)
                const state = day.date === next?.date ? s.isNext : day.date < today ? s.isPast : ''
                return (
                  <li key={day.date} className={`${s.day} ${s[day.type]} ${state}`}>
                    <time dateTime={day.date} className={s.dayDate}>
                      <span>Sun</span>
                      <strong>{date.getUTCDate()}</strong>
                    </time>
                    <div className={s.dayBody}>
                      <span className={s.dayTitle}>
                        {day.title}
                        {day.ramadan && <Icon name="moon" size={14} className={s.moonIcon} />}
                      </span>
                      {day.note && <span className={s.note}>{day.note}</span>}
                      {day.schedule && (
                        <ul className={s.schedule}>
                          {day.schedule.map((item) => (
                            <li key={item.time}>
                              <span className="tabular">{item.time}</span> {item.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="sr-only">{calendar.types[day.type]}</span>
                  </li>
                )
              })}
            </ol>
          </Reveal>
        ))}
      </div>
    </section>
  )
}