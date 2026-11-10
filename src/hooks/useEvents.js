import { useEffect, useMemo, useState } from 'react'
import base from '../content/events.json'
import site from '../content/site.json'
import { partsInTz } from '../lib/prayer'
import { nextDate, cmpDate, parseCsv, eventFromRow } from '../lib/events'

// Events come from src/content/events.json. If a published Google Sheet CSV link is set in
// site.json (integrations.eventsSheetCsv), the sheet replaces the JSON so the board can edit
// events without touching code.
export function useEvents() {
  const [raw, setRaw] = useState(base.events)
  const [source, setSource] = useState('file')

  useEffect(() => {
    const url = site.integrations.eventsSheetCsv
    if (!url) return
    let alive = true
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('sheet'))))
      .then((txt) => {
        const evs = parseCsv(txt).map(eventFromRow).filter((e) => e.title)
        if (alive && evs.length) {
          setRaw(evs)
          setSource('sheet')
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const today = partsInTz(Date.now())
  const dayKey = `${today.y}-${today.m}-${today.d}`

  const events = useMemo(() => {
    return raw
      .map((e) => ({ ...e, next: nextDate(e, today) }))
      .filter((e) => !(e.recurrence?.type === 'date' && e.next && cmpDate(e.next, today) < 0))
      .sort((a, b) => {
        if (a.next && b.next) return cmpDate(a.next, b.next) || (a.start || '').localeCompare(b.start || '')
        if (a.next) return -1
        if (b.next) return 1
        return 0
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, dayKey])

  return { events, source }
}
