import { useEffect, useMemo, useState } from 'react'
import fileEvents from '../content/events.json'
import { site } from '../lib/site'
import { partsInTz } from '../lib/prayer'
import { cmpDate, eventFromRow, nextDate, parseCsv } from '../lib/events'

const sheetUrl = site.integrations.eventsSheetCsv

/** Loads the published Google Sheet, if one is configured. Resolves to an empty list on any failure. */
async function fetchSheetEvents(signal) {
  const res = await fetch(sheetUrl, { signal })
  if (!res.ok) throw new Error(`Events sheet returned ${res.status}`)
  return parseCsv(await res.text())
    .map(eventFromRow)
    .filter(Boolean)
}

/** Orders events by their next date (then start time). Events without a date go last. */
function byNextDate(a, b) {
  if (a.next && b.next) return cmpDate(a.next, b.next) || (a.start || '').localeCompare(b.start || '')
  if (a.next) return -1
  if (b.next) return 1
  return 0
}

/**
 * All events, each with its `next` occurrence date, sorted soonest first. One-off events that have passed are removed.
 *
 * Events come from `src/content/events.json`. When `integrations.eventsSheetCsv` is set in `site.json`, the published
 * Google Sheet replaces the file so the board can edit events without a rebuild. If the sheet fails to load, the file
 * is used.
 */
export function useEvents() {
  const [raw, setRaw] = useState(fileEvents.events)
  const [source, setSource] = useState('file')

  useEffect(() => {
    if (!sheetUrl) return
    const controller = new AbortController()
    fetchSheetEvents(controller.signal)
      .then((events) => {
        if (events.length) {
          setRaw(events)
          setSource('sheet')
        }
      })
      .catch(() => {
        // Keep the bundled events.json on network or parse errors.
      })
    return () => controller.abort()
  }, [])

  const { y, m, d } = partsInTz(Date.now())

  const events = useMemo(() => {
    const today = { y, m, d }
    return raw
      .map((ev) => ({ ...ev, next: nextDate(ev, today) }))
      .filter((ev) => !(ev.recurrence?.type === 'date' && ev.next && cmpDate(ev.next, today) < 0))
      .sort(byNextDate)
  }, [raw, y, m, d])

  return { events, source }
}
