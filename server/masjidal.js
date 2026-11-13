/**
 * Masjidal integration: fetches prayer and iqama times and converts them to the site's own format.
 *
 * Masjidal does not publish API documentation, so the request URL is configurable with MASJIDAL_URL and
 * `normalize()` accepts the field names and time formats Masjidal is known to use. If Masjidal changes its
 * response, this is the only file that needs updating. Run `npm run check:masjidal` to see the raw response.
 */

const DEFAULT_URL = 'https://masjidal.com/api/v1/time/range?masjid_id={id}&from_date={from}&to_date={to}'
const TIMEOUT_MS = 8000

/** Possible Masjidal field names for each prayer, in order of preference. */
const FIELD_NAMES = {
  fajr: ['fajr'],
  sunrise: ['sunrise', 'shuruq', 'shurooq'],
  dhuhr: ['dhuhr', 'zuhr', 'duhr', 'zohr'],
  asr: ['asr'],
  maghrib: ['maghrib'],
  isha: ['isha'],
}

/** Builds the Masjidal request URL for a date range (YYYY-MM-DD). */
export function masjidalUrl(from, to, env = process.env) {
  const template = env.MASJIDAL_URL || DEFAULT_URL
  return template
    .replace('{id}', encodeURIComponent(env.MASJID_ID || ''))
    .replace('{from}', from)
    .replace('{to}', to)
}

/** Calls Masjidal and returns its raw JSON response. Throws on network errors, timeouts and non-2xx responses. */
export async function fetchMasjidal(from, to, env = process.env) {
  const headers = { Accept: 'application/json' }
  if (env.MASJIDAL_API_KEY) headers.Authorization = `Bearer ${env.MASJIDAL_API_KEY}`

  const res = await fetch(masjidalUrl(from, to, env), { headers, signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Masjidal returned HTTP ${res.status}`)
  return res.json()
}

/** "5:10AM", "5:10 pm", "05:10" or "17:10" → "05:10" / "17:10". Returns null if unrecognised. */
export function parseTime(value) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?\s*$/i.exec(String(value ?? ''))
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]?.[0].toLowerCase()
  if (meridiem === 'p' && hours < 12) hours += 12
  if (meridiem === 'a' && hours === 12) hours = 0
  if (hours > 23 || minutes > 59) return null
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function pickTimes(entry) {
  if (!entry || typeof entry !== 'object') return {}
  const lower = Object.fromEntries(Object.entries(entry).map(([k, v]) => [k.toLowerCase(), v]))
  const out = {}
  for (const [key, names] of Object.entries(FIELD_NAMES)) {
    const time = names.map((n) => parseTime(lower[n])).find(Boolean)
    if (time) out[key] = time
  }
  return out
}

function addDaysIso(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/**
 * Converts a Masjidal response to `{ "YYYY-MM-DD": { athan: { fajr: "05:10", ... }, iqama: { ... } } }`.
 * Entries are matched to dates in order, starting at `from`. Throws if no usable times are found.
 */
export function normalize(raw, from) {
  const root = raw?.data ?? raw
  const athanList = root?.salah ?? root?.athan ?? root?.prayers
  const iqamaList = root?.iqamah ?? root?.iqama ?? []

  if (!Array.isArray(athanList) || athanList.length === 0) {
    throw new Error('Masjidal response has no prayer times list')
  }

  const days = {}
  athanList.forEach((entry, i) => {
    const athan = pickTimes(entry)
    if (Object.keys(athan).length === 0) return
    days[addDaysIso(from, i)] = { athan, iqama: pickTimes(iqamaList[i]) }
  })

  if (Object.keys(days).length === 0) throw new Error('Masjidal response has no readable times')
  return days
}
