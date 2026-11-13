import { fetchMasjidal, masjidalKey, normalize } from './masjidal.js'

const CACHE_MS = 15 * 60 * 1000
const MAX_RANGE_DAYS = 62
// Only serve dates near today, so the cache and Masjidal can't be flooded with arbitrary dates.
const MAX_DAYS_FROM_TODAY = 400
const MAX_CACHE_ENTRIES = 100
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const cache = new Map()

const daysBetween = (from, to) => (Date.parse(to) - Date.parse(from)) / 86400000

/**
 * Handles GET /api/prayer-times?from=YYYY-MM-DD&to=YYYY-MM-DD.
 * Framework-independent so it can be used by both the production server and the Vite dev server.
 *
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function getPrayerTimes(query, env = process.env) {
  const from = query.from
  const to = query.to || query.from

  if (!ISO_DATE.test(from || '') || !ISO_DATE.test(to || '') || Number.isNaN(Date.parse(from))) {
    return { status: 400, body: { error: 'Use ?from=YYYY-MM-DD&to=YYYY-MM-DD' } }
  }
  const range = daysBetween(from, to)
  if (!(range >= 0 && range <= MAX_RANGE_DAYS)) {
    return { status: 400, body: { error: `The date range must be 0–${MAX_RANGE_DAYS} days` } }
  }
  const today = new Date().toISOString().slice(0, 10)
  if (Math.abs(daysBetween(today, from)) > MAX_DAYS_FROM_TODAY) {
    return { status: 400, body: { error: `Dates must be within ${MAX_DAYS_FROM_TODAY} days of today` } }
  }
  if (!masjidalKey(env)) {
    return { status: 503, body: { error: 'MASJIDAL_API_KEY is not configured on the server' } }
  }

  const key = `${from}_${to}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_MS) return { status: 200, body: cached.body }

  try {
    const body = { source: 'masjidal', days: normalize(await fetchMasjidal(from, to, env), from) }
    // Evict the oldest entry once the cache is full (Maps keep insertion order).
    if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
    cache.set(key, { at: Date.now(), body })
    return { status: 200, body }
  } catch (err) {
    console.error(`[prayer-times] ${from}..${to}: ${err.message}`)
    return { status: 502, body: { error: 'Prayer times are temporarily unavailable' } }
  }
}