import { useMemo } from 'react'
import { addDays, fmtLongDate, hijriLabel, partsInTz, PRAYER_ORDER, PRAYERS } from '../lib/prayer'
import { getDayTimes, usePrayerSchedule } from '../lib/prayerSchedule'
import { useNow } from './useNow'

const HOUR = 3600000
const MINUTE = 60000

/**
 * Today's prayer times at the masjid with a live countdown to the next prayer. Re-renders every second.
 *
 * After Isha, "next" is tomorrow's Fajr. Uses the masjid's Masjidal times once loaded, calculated times until then.
 */
export function usePrayerTimes() {
  const now = useNow(1000)
  const { y, m, d } = partsInTz(now)

  const yesterday = addDays({ y, m, d }, -1)
  const tomorrow = addDays({ y, m, d }, 1)
  const live = usePrayerSchedule(yesterday, tomorrow)

  // Recompute only when the date changes or live times arrive, not every tick.
  const { times, iqamas, isLive, tomorrowTimes, yesterdayIsha } = useMemo(() => {
    const today = getDayTimes({ y, m, d }, live)
    return {
      times: today.athan,
      iqamas: today.iqama,
      isLive: today.isLive,
      tomorrowTimes: getDayTimes(addDays({ y, m, d }, 1), live),
      yesterdayIsha: getDayTimes(addDays({ y, m, d }, -1), live).athan.isha,
    }
  }, [y, m, d, live])
  const tomorrowFajr = tomorrowTimes.athan.fajr

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
    iqama: iqamas[p.key],
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
      iqama: upcomingKey ? iqamas[nextKey] : tomorrowTimes.iqama.fajr,
    },
    progress,
    countdown,
    dateLabel: fmtLongDate(now),
    hijri: hijriLabel(now),
    isLive,
  }
}
