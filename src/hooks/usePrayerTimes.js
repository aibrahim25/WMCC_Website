import { useMemo } from 'react'
import { addDays, calcDay, fmtLongDate, hijriLabel, iqamaFor, partsInTz, PRAYER_ORDER, PRAYERS } from '../lib/prayer'
import { useNow } from './useNow'

const HOUR = 3600000
const MINUTE = 60000

/**
 * Today's prayer times at the masjid with a live countdown to the next prayer. Re-renders every second.
 *
 * After Isha, "next" is tomorrow's Fajr.
 */
export function usePrayerTimes() {
  const now = useNow(1000)
  const { y, m, d } = partsInTz(now)

  // Recalculate only when the date changes, not every tick.
  const { times, tomorrowFajr, yesterdayIsha } = useMemo(() => {
    const today = { y, m, d }
    const tomorrow = addDays(today, 1)
    const yesterday = addDays(today, -1)
    return {
      times: calcDay(y, m, d),
      tomorrowFajr: calcDay(tomorrow.y, tomorrow.m, tomorrow.d).fajr,
      yesterdayIsha: calcDay(yesterday.y, yesterday.m, yesterday.d).isha,
    }
  }, [y, m, d])

  const upcomingKey = PRAYER_ORDER.find((key) => times[key] > now)
  const nextKey = upcomingKey || 'fajr'
  const nextAt = upcomingKey ? times[upcomingKey] : tomorrowFajr

  // Progress through the gap between the previous prayer and the next one, 0–1.
  const nextIndex = upcomingKey ? PRAYER_ORDER.indexOf(upcomingKey) : PRAYER_ORDER.length
  const prevAt = nextIndex === 0 ? yesterdayIsha : times[PRAYER_ORDER[nextIndex - 1]]
  const progress = Math.min(1, Math.max(0, (now - prevAt) / (nextAt - prevAt)))

  const remaining = Math.max(0, nextAt - now)
  const countdown = {
    h: Math.floor(remaining / HOUR),
    m: Math.floor((remaining % HOUR) / MINUTE),
    s: Math.floor((remaining % MINUTE) / 1000),
  }

  const list = PRAYERS.map((p) => ({
    ...p,
    athan: times[p.key],
    iqama: p.noIqama ? null : iqamaFor(p.key, times[p.key]),
    // Only highlight a row when the next prayer is today (not tomorrow's Fajr).
    isNext: p.key === nextKey && times[p.key] === nextAt,
  }))

  return {
    now,
    today: { y, m, d },
    list,
    next: {
      key: nextKey,
      name: PRAYERS.find((p) => p.key === nextKey).name,
      at: nextAt,
      iqama: iqamaFor(nextKey, nextAt),
    },
    progress,
    countdown,
    dateLabel: fmtLongDate(now),
    hijri: hijriLabel(now),
  }
}
