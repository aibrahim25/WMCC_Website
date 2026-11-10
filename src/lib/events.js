import site from '../content/site.json'
import { addDays, TZ } from './prayer'

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const RRULE_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'youth', label: 'Youth' },
  { id: 'classes', label: 'Classes' },
  { id: 'sisters', label: 'Sisters' },
  { id: 'community', label: 'Community' },
]

export function nthWeekday(y, m, weekday, n) {
  if (n > 0) {
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
    return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7
  }
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lastW = new Date(Date.UTC(y, m - 1, lastDay)).getUTCDay()
  return lastDay - ((lastW - weekday + 7) % 7)
}

export const cmpDate = (a, b) => (a.y - b.y) * 10000 + (a.m - b.m) * 100 + (a.d - b.d)

// Works out the next date an event happens on, from today's date in Windham.
export function nextDate(ev, from) {
  const r = ev.recurrence || { type: 'none' }
  if (r.type === 'weekly') {
    const cur = new Date(Date.UTC(from.y, from.m - 1, from.d)).getUTCDay()
    return addDays(from, (r.weekday - cur + 7) % 7)
  }
  if (r.type === 'nth') {
    let { y, m } = from
    let d = nthWeekday(y, m, r.weekday, r.nth)
    if (d < from.d) {
      m += 1
      if (m > 12) {
        m = 1
        y += 1
      }
      d = nthWeekday(y, m, r.weekday, r.nth)
    }
    return { y, m, d }
  }
  if (r.type === 'date' && r.date) {
    const [y, m, d] = r.date.split('-').map(Number)
    return { y, m, d }
  }
  return null
}

const to12 = (hhmm) => {
  const [h, mi] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return { text: `${((h + 11) % 12) + 1}:${String(mi).padStart(2, '0')}`, suffix }
}

export function timeRange(ev) {
  if (!ev.start) return ''
  const a = to12(ev.start)
  if (!ev.end) return `${a.text} ${a.suffix}`
  const b = to12(ev.end)
  return a.suffix === b.suffix ? `${a.text} – ${b.text} ${b.suffix}` : `${a.text} ${a.suffix} – ${b.text} ${b.suffix}`
}

export function dateLabel(date) {
  if (!date) return ''
  const wd = new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()
  return `${WEEKDAYS[wd]}, ${MONTHS_SHORT[date.m - 1]} ${date.d}`
}

// Google Calendar "add event" link, with a repeat rule for recurring events.
export function gcalLink(ev) {
  const date = ev.next
  if (!date || !ev.start) return null
  const pad = (n) => String(n).padStart(2, '0')
  const ymd = `${date.y}${pad(date.m)}${pad(date.d)}`
  const end = ev.end || `${pad(Number(ev.start.split(':')[0]) + 1)}:${ev.start.split(':')[1]}`
  const dates = `${ymd}T${ev.start.replace(':', '')}00/${ymd}T${end.replace(':', '')}00`
  const a = site.address
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${ev.title} · WMCC`,
    dates,
    ctz: TZ,
    details: ev.description || '',
    location: `${site.name}, ${a.street}, ${a.city}, ${a.state} ${a.zip}`,
  })
  const r = ev.recurrence || {}
  if (r.type === 'weekly') params.set('recur', `RRULE:FREQ=WEEKLY;BYDAY=${RRULE_DAYS[r.weekday]}`)
  if (r.type === 'nth') params.set('recur', `RRULE:FREQ=MONTHLY;BYDAY=${r.nth}${RRULE_DAYS[r.weekday]}`)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Minimal CSV parser (handles quotes and commas inside quotes) for a published Google Sheet.
export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  const [head, ...body] = rows
  if (!head) return []
  const keys = head.map((h) => h.trim().toLowerCase())
  return body.filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || '').trim()])))
}

export function eventFromRow(row) {
  const wd = WEEKDAYS.findIndex((w) => w.toLowerCase() === (row.weekday || '').toLowerCase())
  return {
    id: row.id || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: row.title,
    category: (row.category || 'community').toLowerCase(),
    audience: row.audience,
    schedule: row.schedule,
    recurrence: { type: (row.recurrence || 'none').toLowerCase(), weekday: wd, nth: Number(row.nth) || undefined, date: row.date },
    start: row.start || undefined,
    end: row.end || undefined,
    location: row.location || 'WMCC, Windham NH',
    description: row.description,
    tags: row.tags ? row.tags.split('|').map((t) => t.trim()) : [],
    featured: /^(yes|true|1)$/i.test(row.featured || ''),
    link: row.link || undefined,
  }
}
