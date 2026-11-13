import { useEffect, useSyncExternalStore } from 'react'
import { site } from './site'
import { calcDay, iqamaFor, isoDate, PRAYERS, zonedTimeToMs } from './prayer'

/**
 * Prayer times from the masjid's Masjidal schedule (via the site's /api/prayer-times endpoint), with the built-in
 * astronomical calculation as a fallback for any day or prayer the API doesn't provide.
 */

const apiUrl = site.integrations.prayerTimesApi

/**
 * Live times loaded so far, shared by every component:
 * `{ "YYYY-MM-DD": { athan: { fajr: "05:10", ... }, iqama: { ... } } }`. Replaced (never mutated) on each load.
 */
let liveDays = {}
const requested = new Set()
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function loadRange(from, to) {
  const key = `${from}_${to}`
  if (!apiUrl || requested.has(key)) return
  requested.add(key)
  try {
    const res = await fetch(`${apiUrl}?from=${from}&to=${to}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { days } = await res.json()
    liveDays = { ...liveDays, ...days }
    listeners.forEach((notify) => notify())
  } catch (err) {
    // Calculated times stay in place. Allow a retry the next time this range is requested.
    requested.delete(key)
    console.warn(`Live prayer times unavailable, using calculated times (${err.message})`)
  }
}

/**
 * Athan and iqama times (epoch ms) for one date: Masjidal times from `live` where available, calculated otherwise.
 *
 * @param {{ y: number, m: number, d: number }} date
 * @param {object} live Snapshot from usePrayerSchedule()
 * @returns {{ athan: Record<string, number>, iqama: Record<string, number|null>, isLive: boolean }}
 */
export function getDayTimes(date, live = {}) {
  const calculated = calcDay(date.y, date.m, date.d)
  const day = live[isoDate(date)]
  const athan = {}
  const iqama = {}

  for (const { key, noIqama } of PRAYERS) {
    athan[key] = day?.athan?.[key] ? zonedTimeToMs(date, day.athan[key]) : calculated[key]
    if (noIqama) iqama[key] = null
    else iqama[key] = day?.iqama?.[key] ? zonedTimeToMs(date, day.iqama[key]) : iqamaFor(key, athan[key])
  }
  return { athan, iqama, isLive: Boolean(day) }
}

/**
 * Loads Masjidal times for a date range (once per range) and returns the snapshot of all live times loaded so far.
 * Components re-render when new times arrive.
 */
export function usePrayerSchedule(from, to) {
  const fromIso = isoDate(from)
  const toIso = isoDate(to)

  useEffect(() => {
    loadRange(fromIso, toIso)
  }, [fromIso, toIso])

  return useSyncExternalStore(subscribe, () => liveDays)
}
