import { site } from './site'

const { lat, lng, timezone } = site.location
const settings = site.prayer

/** IANA time zone of the masjid. All displayed times are in this zone, whatever the visitor's device says. */
export const TZ = timezone

export const PRAYERS = [
  { key: 'fajr', name: 'Fajr', ar: 'الفجر' },
  { key: 'sunrise', name: 'Sunrise', ar: 'الشروق', noIqama: true },
  { key: 'dhuhr', name: 'Dhuhr', ar: 'الظهر' },
  { key: 'asr', name: 'Asr', ar: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', ar: 'المغرب' },
  { key: 'isha', name: 'Isha', ar: 'العشاء' },
]

/** The five daily prayers in order (sunrise excluded). */
export const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export const jumuah = settings.jumuah

/**
 * Astronomical prayer times for one calendar day at the masjid, using the same formulas as praytimes.org.
 * Angles and the Asr factor come from `site.json → prayer`.
 *
 * @param {number} y Year
 * @param {number} m Month, 1–12
 * @param {number} d Day of the month
 * @returns {Record<'fajr'|'sunrise'|'dhuhr'|'asr'|'maghrib'|'isha', number>} Epoch milliseconds for each time
 */
export function calcDay(y, m, d) {
  const RAD = Math.PI / 180
  const fix = (a, b) => {
    a = a - b * Math.floor(a / b)
    return a < 0 ? a + b : a
  }
  const sin = (deg) => Math.sin(deg * RAD)
  const cos = (deg) => Math.cos(deg * RAD)
  const tan = (deg) => Math.tan(deg * RAD)

  // Julian date
  let Y = y
  let M = m
  if (M <= 2) {
    Y -= 1
    M += 12
  }
  const A = Math.floor(Y / 100)
  const B = 2 - A + Math.floor(A / 4)
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5
  const jDate = jd - lng / (15 * 24)

  // Sun declination and equation of time
  const sunPosition = (j) => {
    const D = j - 2451545.0
    const g = fix(357.529 + 0.98560028 * D, 360)
    const q = fix(280.459 + 0.98564736 * D, 360)
    const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360)
    const e = 23.439 - 0.00000036 * D
    const RA = Math.atan2(cos(e) * sin(L), cos(L)) / RAD / 15
    return { decl: Math.asin(sin(e) * sin(L)) / RAD, eqt: q / 15 - fix(RA, 24) }
  }
  const midDay = (t) => fix(12 - sunPosition(jDate + t).eqt, 24)
  // Time at which the sun reaches `angle` below the horizon (before noon when `ccw` is true).
  const sunAngleTime = (angle, t, ccw) => {
    const { decl } = sunPosition(jDate + t)
    const T = Math.acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / RAD / 15
    return midDay(t) + (ccw ? -T : T)
  }
  const asrTime = (t) => {
    const { decl } = sunPosition(jDate + t)
    return sunAngleTime(-Math.atan(1 / (settings.asrFactor + tan(Math.abs(lat - decl)))) / RAD, t)
  }

  // Local solar hours; the second argument is the approximate time of day used to refine the sun position.
  const hours = {
    fajr: sunAngleTime(settings.fajrAngle, 5 / 24, true),
    sunrise: sunAngleTime(0.833, 6 / 24, true),
    dhuhr: midDay(12 / 24),
    asr: asrTime(13 / 24),
    maghrib: sunAngleTime(0.833, 18 / 24),
    isha: sunAngleTime(settings.ishaAngle, 18 / 24),
  }

  // Convert solar hours to UTC epoch ms, rounded to the minute.
  const midnightUtc = Date.UTC(y, m - 1, d)
  const out = {}
  for (const key in hours) out[key] = midnightUtc + Math.round((hours[key] - lng / 15) * 60) * 60000
  return out
}

/** Iqama time for a prayer, from the offsets in `site.json`, or null if that prayer has no iqama. */
export function iqamaFor(key, athanMs) {
  const offset = settings.iqamaOffsets[key]
  return offset == null ? null : athanMs + offset * 60000
}

// ---------------------------------------------------------------------------
// Calendar dates in the masjid's time zone, as plain { y, m, d } objects (m is 1–12).
// ---------------------------------------------------------------------------

/** The calendar date at the masjid at the given instant. */
export function partsInTz(ms) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(ms)
  const get = (type) => Number(parts.find((p) => p.type === type).value)
  return { y: get('year'), m: get('month'), d: get('day') }
}

export function addDays({ y, m, d }, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

/** Shifts a { y, m } month by `n` months. */
export function addMonths({ y, m }, n) {
  const index = y * 12 + (m - 1) + n
  return { y: Math.floor(index / 12), m: (index % 12) + 1 }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** "5:42 AM" in the masjid's time zone. */
export const fmtTime = (ms) =>
  new Date(ms).toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })

/** "Tuesday, November 10" in the masjid's time zone. */
export const fmtLongDate = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' })

/** Hijri (Umm al-Qura) date, e.g. "19 Jumada I 1448 AH". Empty if the browser lacks the Islamic calendar. */
export function hijriLabel(ms) {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      timeZone: TZ,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(ms)
  } catch {
    return ''
  }
}
