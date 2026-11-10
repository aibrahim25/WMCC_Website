import { useEffect, useMemo, useState } from 'react'
import { PRAYERS, PRAYER_ORDER, calcDay, partsInTz, addDays, hijriLabel, iqamaFor, TZ } from '../lib/prayer'

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

// Today's prayer times for Windham plus a live countdown to the next one.
export function usePrayerTimes() {
  const now = useNow(1000)
  const today = partsInTz(now)
  const key = `${today.y}-${today.m}-${today.d}`

  const { t, tomorrowFajr, yesterdayIsha } = useMemo(() => {
    const tm = addDays(today, 1)
    const yd = addDays(today, -1)
    return {
      t: calcDay(today.y, today.m, today.d),
      tomorrowFajr: calcDay(tm.y, tm.m, tm.d).fajr,
      yesterdayIsha: calcDay(yd.y, yd.m, yd.d).isha,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  let nextKey = PRAYER_ORDER.find((k) => t[k] > now)
  const nextAt = nextKey ? t[nextKey] : tomorrowFajr
  const idx = nextKey ? PRAYER_ORDER.indexOf(nextKey) : PRAYER_ORDER.length
  if (!nextKey) nextKey = 'fajr'
  const prevAt = idx === 0 ? yesterdayIsha : t[PRAYER_ORDER[idx - 1]]

  const progress = Math.min(1, Math.max(0, (now - prevAt) / (nextAt - prevAt)))
  const diff = Math.max(0, nextAt - now)
  const countdown = {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }

  const list = PRAYERS.map((p) => ({
    ...p,
    athan: t[p.key],
    iqama: p.noIqama ? null : iqamaFor(p.key, t[p.key]),
    isNext: p.key === nextKey && t[p.key] === nextAt,
  }))

  return {
    now,
    today,
    list,
    next: { key: nextKey, name: PRAYERS.find((p) => p.key === nextKey).name, at: nextAt, iqama: iqamaFor(nextKey, nextAt) },
    progress,
    countdown,
    dateLabel: new Date(now).toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' }),
    hijri: hijriLabel(now),
  }
}
