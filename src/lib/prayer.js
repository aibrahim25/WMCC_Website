import site from '../content/site.json'

const { lat, lng, timezone } = site.location
const P = site.prayer

export const TZ = timezone

export const PRAYERS = [
  { key: 'fajr', name: 'Fajr', ar: 'الفجر' },
  { key: 'sunrise', name: 'Sunrise', ar: 'الشروق', noIqama: true },
  { key: 'dhuhr', name: 'Dhuhr', ar: 'الظهر' },
  { key: 'asr', name: 'Asr', ar: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', ar: 'المغرب' },
  { key: 'isha', name: 'Isha', ar: 'العشاء' },
]

export const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

// Astronomical prayer time calculation (same math as praytimes.org).
// Returns epoch milliseconds for each time on the given calendar date in Windham.
export function calcDay(y, m, d) {
  const R = Math.PI / 180
  const fix = (a, b) => {
    a = a - b * Math.floor(a / b)
    return a < 0 ? a + b : a
  }
  const sn = (x) => Math.sin(x * R)
  const cs = (x) => Math.cos(x * R)
  const tn = (x) => Math.tan(x * R)

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

  const sun = (j) => {
    const D = j - 2451545.0
    const g = fix(357.529 + 0.98560028 * D, 360)
    const q = fix(280.459 + 0.98564736 * D, 360)
    const L = fix(q + 1.915 * sn(g) + 0.02 * sn(2 * g), 360)
    const e = 23.439 - 0.00000036 * D
    const RA = Math.atan2(cs(e) * sn(L), cs(L)) / R / 15
    return { decl: Math.asin(sn(e) * sn(L)) / R, eqt: q / 15 - fix(RA, 24) }
  }
  const mid = (t) => fix(12 - sun(jDate + t).eqt, 24)
  const angle = (a, t, ccw) => {
    const s = sun(jDate + t)
    const T = Math.acos((-sn(a) - sn(s.decl) * sn(lat)) / (cs(s.decl) * cs(lat))) / R / 15
    return mid(t) + (ccw ? -T : T)
  }
  const asr = (t) => {
    const s = sun(jDate + t)
    return angle(-Math.atan(1 / (P.asrFactor + tn(Math.abs(lat - s.decl)))) / R, t)
  }

  const hours = {
    fajr: angle(P.fajrAngle, 5 / 24, true),
    sunrise: angle(0.833, 6 / 24, true),
    dhuhr: mid(12 / 24),
    asr: asr(13 / 24),
    maghrib: angle(0.833, 18 / 24),
    isha: angle(P.ishaAngle, 18 / 24),
  }
  const base = Date.UTC(y, m - 1, d)
  const out = {}
  for (const k in hours) out[k] = base + Math.round((hours[k] - lng / 15) * 60) * 60000
  return out
}

export function partsInTz(ms) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(ms)
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  return { y: get('year'), m: get('month'), d: get('day') }
}

export function addDays({ y, m, d }, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

export const fmtTime = (ms) => new Date(ms).toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })

export function hijriLabel(ms) {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }).format(ms)
  } catch {
    return ''
  }
}

export function iqamaFor(key, athanMs) {
  const off = P.iqamaOffsets[key]
  return off == null ? null : athanMs + off * 60000
}

export const jumuah = P.jumuah
