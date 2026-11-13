/**
 * Masjidal integration: fetches prayer and iqama times and converts them to the site's own format.
 *
 * Request: GET https://api.masjidal.com/timings?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD with the masjid's server key
 * in the `x-api-key` header. The key identifies the masjid, so no masjid ID is needed.
 *
 * `normalize()` accepts the common layouts for prayer-time data. If Masjidal's response doesn't match, this is the
 * only file that needs updating. Run `npm run check:masjidal` to see the raw response.
 */

const DEFAULT_URL = 'https://api.masjidal.com/timings?start_date={from}&end_date={to}'
const ACCEPT = 'application/vnd.masjidal.com.v1+json'
const TIMEOUT_MS = 8000

/** Possible field names for each prayer, in order of preference. */
const FIELD_NAMES = {
  fajr: ['fajr'],
  sunrise: ['sunrise', 'shuruq', 'shurooq'],
  dhuhr: ['dhuhr', 'zuhr', 'duhr', 'zohr'],
  asr: ['asr'],
  maghrib: ['maghrib'],
  isha: ['isha'],
}
const ATHAN_NAMES = ['athan', 'adhan', 'azan', 'salah', 'start', 'begins', 'time']
const IQAMA_NAMES = ['iqama', 'iqamah', 'jamaat', 'jamah', 'congregation']

/** The server key, from MASJIDAL_API_KEY (or MASJIDAL_SERVER_KEY, the name Masjidal's examples use). */
export const masjidalKey = (env = process.env) => env.MASJIDAL_API_KEY || env.MASJIDAL_SERVER_KEY || ''

/** Builds the Masjidal request URL for a date range (YYYY-MM-DD). */
export function masjidalUrl(from, to, env = process.env) {
  return (env.MASJIDAL_URL || DEFAULT_URL).replace('{from}', from).replace('{to}', to)
}

/** Calls Masjidal and returns its raw JSON response. Throws on network errors, timeouts and non-2xx responses. */
export async function fetchMasjidal(from, to, env = process.env) {
  const res = await fetch(masjidalUrl(from, to, env), {
    headers: { Accept: ACCEPT, 'x-api-key': masjidalKey(env) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Masjidal returned HTTP ${res.status}`)
  return res.json()
}

/**
 * "5:10AM", "5:10 pm", "05:10", "17:10", "05:10:00" or "2026-11-11T05:10:00-05:00" → "05:10" / "17:10".
 * Returns null if unrecognised. ISO date-times are read as the masjid's local wall-clock time.
 */
export function parseTime(value) {
  const text = String(value ?? '').trim()
  const iso = /T(\d{2}):(\d{2})/.exec(text)
  const match = iso || /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?$/i.exec(text)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]?.[0].toLowerCase()
  if (meridiem === 'p' && hours < 12) hours += 12
  if (meridiem === 'a' && hours === 12) hours = 0
  if (hours > 23 || minutes > 59) return null
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v)
const lowerKeys = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))
const firstOf = (obj, names) => names.map((n) => obj[n]).find((v) => v != null)

/**
 * Reads athan and iqama times from one day's data. Handles:
 * - `{ fajr: "5:10 AM", ... }` (athan only)
 * - `{ athan: { fajr: ... }, iqama: { fajr: ... } }`
 * - `{ fajr: { athan: "5:10 AM", iqama: "5:40 AM" }, ... }`
 * - `{ fajr: "5:10 AM", fajr_iqama: "5:40 AM", ... }`
 */
function readDay(entry) {
  const day = lowerKeys(entry)
  const athanGroup = firstOf(day, ATHAN_NAMES.concat('prayers', 'timings'))
  const iqamaGroup = firstOf(day, IQAMA_NAMES)
  const athanSource = isObject(athanGroup) ? lowerKeys(athanGroup) : day
  const iqamaSource = isObject(iqamaGroup) ? lowerKeys(iqamaGroup) : {}

  const athan = {}
  const iqama = {}
  for (const [key, names] of Object.entries(FIELD_NAMES)) {
    for (const name of names) {
      const value = athanSource[name]
      const nested = isObject(value) ? lowerKeys(value) : null
      const a = parseTime(nested ? firstOf(nested, ATHAN_NAMES) : value)
      const i = parseTime(
        (nested && firstOf(nested, IQAMA_NAMES)) ??
          iqamaSource[name] ??
          firstOf(
            day,
            IQAMA_NAMES.flatMap((s) => [`${name}_${s}`, `${name}${s}`]),
          ),
      )
      if (a && !athan[key]) athan[key] = a
      if (i && !iqama[key]) iqama[key] = i
    }
  }
  return { athan, iqama }
}

function addDaysIso(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** "2026-11-11", "2026-11-11T00:00:00Z" → "2026-11-11"; anything else → null. */
const isoDateOf = (value) => /^(\d{4}-\d{2}-\d{2})/.exec(String(value ?? ''))?.[1] ?? null

/** Finds the list of days in the response, as [dateOrNull, dayData] pairs. */
function findDays(raw) {
  const root = raw?.data ?? raw

  // Separate athan and iqama lists: { salah: [...], iqamah: [...] }
  if (Array.isArray(root?.salah)) {
    return root.salah.map((entry, i) => [isoDateOf(entry?.date), { athan: entry, iqama: root.iqamah?.[i] ?? {} }])
  }

  const list = [root, root?.timings, root?.days, root?.data].find(
    (v) => Array.isArray(v) || (isObject(v) && Object.keys(v).some(isoDateOf)),
  )
  if (Array.isArray(list)) return list.map((entry) => [isoDateOf(entry?.date ?? entry?.day), entry])
  if (isObject(list))
    return Object.entries(list)
      .filter(([k]) => isoDateOf(k))
      .map(([k, v]) => [isoDateOf(k), v])
  return []
}

/**
 * Converts a Masjidal response to `{ "YYYY-MM-DD": { athan: { fajr: "05:10", ... }, iqama: { ... } } }`.
 * Uses each entry's own date when it has one, otherwise counts days from `from`. Throws if no times are found.
 */
export function normalize(raw, from) {
  const days = {}
  findDays(raw).forEach(([date, entry], i) => {
    if (!isObject(entry)) return
    const { athan, iqama } = readDay(entry)
    if (Object.keys(athan).length) days[date || addDaysIso(from, i)] = { athan, iqama }
  })
  if (Object.keys(days).length === 0) throw new Error('Masjidal response has no readable prayer times')
  return days
}