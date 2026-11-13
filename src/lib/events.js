import { fullAddress, site } from './site'
import { addDays, TZ } from './prayer'
import { pad2 } from './format'

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const RRULE_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

const DEFAULT_LOCATION = 'WMCC, Londonderry NH'
const DEFAULT_CATEGORY = 'community'

/** Filter options for the Events page. Every id except "all" is a valid event `category`. */
export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'youth', label: 'Youth' },
  { id: 'classes', label: 'Classes' },
  { id: 'sisters', label: 'Sisters' },
  { id: 'community', label: 'Community' },
]

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))

export const categoryLabel = (id) => CATEGORY_LABELS[id] || CATEGORY_LABELS[DEFAULT_CATEGORY]

export const eventLocation = (ev) => ev.location || DEFAULT_LOCATION

/**
 * The event's `link` if it is a page on this site ("/school"), otherwise null. Rejects external and protocol-relative
 * URLs ("//evil.com", "/\\evil.com") so content from the Google Sheet can't redirect visitors off-site.
 */
/** `url` if it is an https:// address, otherwise null. Blocks javascript: and other unsafe links from the sheet. */
export const safeExternalUrl = (url) => (/^https:\/\//i.test(url || '') ? url : null)

export const internalLink = (ev) => (/^\/(?![/\\])/.test(ev.link || '') ? ev.link : null)

// ---------------------------------------------------------------------------
// Dates. Calendar dates are plain { y, m, d } objects (m is 1–12) in the masjid's time zone.
// ---------------------------------------------------------------------------

const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate()
const weekdayOf = ({ y, m, d }) => new Date(Date.UTC(y, m - 1, d)).getUTCDay()

/** Compares two calendar dates. Negative if `a` is earlier, 0 if equal, positive if later. */
export const cmpDate = (a, b) => (a.y - b.y) * 10000 + (a.m - b.m) * 100 + (a.d - b.d)

/**
 * Day of the month for the `n`th `weekday` (0 = Sunday) of a month. `n = -1` means the last one.
 * Returns null when the month has no such day (e.g. a 5th Friday).
 */
export function nthWeekday(y, m, weekday, n) {
  const lastDay = daysInMonth(y, m)
  if (n < 0) {
    const lastWeekday = weekdayOf({ y, m, d: lastDay })
    return lastDay - ((lastWeekday - weekday + 7) % 7)
  }
  const firstWeekday = weekdayOf({ y, m, d: 1 })
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7
  return day <= lastDay ? day : null
}

/** The next date (today included) on which an event happens, or null if it has no fixed date. */
export function nextDate(ev, from) {
  const r = ev.recurrence || { type: 'none' }

  const validWeekday = Number.isInteger(r.weekday) && r.weekday >= 0 && r.weekday <= 6

  if (r.type === 'weekly' && validWeekday) {
    return addDays(from, (r.weekday - weekdayOf(from) + 7) % 7)
  }

  if (r.type === 'nth' && validWeekday && r.nth) {
    let { y, m } = from
    // Look up to a year ahead; a "5th weekday" rule skips months that don't have one.
    for (let i = 0; i < 12; i++) {
      const d = nthWeekday(y, m, r.weekday, r.nth)
      if (d && (i > 0 || d >= from.d)) return { y, m, d }
      m = (m % 12) + 1
      if (m === 1) y += 1
    }
    return null
  }

  if (r.type === 'date' && r.date) {
    const [y, m, d] = r.date.split('-').map(Number)
    return { y, m, d }
  }

  return null
}

/** "Friday, Mar 20" */
export function dateLabel(date) {
  if (!date) return ''
  return `${WEEKDAYS[weekdayOf(date)]}, ${MONTHS_SHORT[date.m - 1]} ${date.d}`
}

// ---------------------------------------------------------------------------
// Times. Event times are 24-hour "HH:MM" strings.
// ---------------------------------------------------------------------------

function to12h(hhmm) {
  const [h, min] = hhmm.split(':').map(Number)
  return { text: `${((h + 11) % 12) + 1}:${pad2(min)}`, suffix: h >= 12 ? 'PM' : 'AM' }
}

/** "7:00 – 9:00 PM", or "11:00 AM – 1:00 PM" when the range crosses noon. */
export function timeRange(ev) {
  if (!ev.start) return ''
  const a = to12h(ev.start)
  if (!ev.end) return `${a.text} ${a.suffix}`
  const b = to12h(ev.end)
  return a.suffix === b.suffix ? `${a.text} – ${b.text} ${b.suffix}` : `${a.text} ${a.suffix} – ${b.text} ${b.suffix}`
}

/** Adds minutes to an "HH:MM" time, capped at 23:59 so it stays on the same day. */
function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59)
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`
}

// ---------------------------------------------------------------------------
// Google Calendar
// ---------------------------------------------------------------------------

/** "Add to Google Calendar" link, including a repeat rule for recurring events. Null if the event has no time. */
export function gcalLink(ev) {
  const date = ev.next
  if (!date || !ev.start) return null

  const ymd = `${date.y}${pad2(date.m)}${pad2(date.d)}`
  const stamp = (hhmm) => `${ymd}T${hhmm.replace(':', '')}00`
  const end = ev.end || addMinutes(ev.start, 60)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${ev.title} · ${site.shortName}`,
    dates: `${stamp(ev.start)}/${stamp(end)}`,
    ctz: TZ,
    details: ev.description || '',
    location: `${site.name}, ${fullAddress()}`,
  })

  const r = ev.recurrence || {}
  if (r.type === 'weekly') params.set('recur', `RRULE:FREQ=WEEKLY;BYDAY=${RRULE_DAYS[r.weekday]}`)
  if (r.type === 'nth') params.set('recur', `RRULE:FREQ=MONTHLY;BYDAY=${r.nth}${RRULE_DAYS[r.weekday]}`)

  return `https://calendar.google.com/calendar/render?${params}`
}

// ---------------------------------------------------------------------------
// Google Sheet import
// ---------------------------------------------------------------------------

/**
 * Minimal CSV parser for a published Google Sheet. Handles quoted cells, escaped quotes ("")
 * and commas or line breaks inside quotes. Returns one object per row, keyed by lower-cased header.
 */
export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        cell += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += c
    }
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  const [header, ...body] = rows
  if (!header) return []
  const keys = header.map((h) => h.trim().toLowerCase())
  return body
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || '').trim()])))
}

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Converts one Google Sheet row (see README for the columns) into an event. Returns null for rows without a title. */
export function eventFromRow(row) {
  if (!row.title) return null
  const weekday = WEEKDAYS.findIndex((w) => w.toLowerCase() === (row.weekday || '').toLowerCase())
  return {
    id: row.id || slugify(row.title),
    title: row.title,
    category: (row.category || DEFAULT_CATEGORY).toLowerCase(),
    audience: row.audience,
    schedule: row.schedule,
    recurrence: {
      type: (row.recurrence || 'none').toLowerCase(),
      weekday: weekday >= 0 ? weekday : undefined,
      nth: Number(row.nth) || undefined,
      date: row.date || undefined,
    },
    start: row.start || undefined,
    end: row.end || undefined,
    location: row.location || DEFAULT_LOCATION,
    description: row.description,
    tags: row.tags ? row.tags.split('|').map((t) => t.trim()) : [],
    featured: /^(yes|true|1)$/i.test(row.featured || ''),
    link: row.link || undefined,
    instagram: row.instagram || undefined,
  }
}
