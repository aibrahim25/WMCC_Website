import { useState } from 'react'

// Sends a form to Formspree (https://formspree.io) when a form ID is set in site.json.
// Without an ID it runs in demo mode and simply shows the success state.
export function useSubmit(formId) {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function submit(data) {
    setStatus('sending')
    if (!formId) {
      await new Promise((r) => setTimeout(r, 700))
      setStatus('sent')
      return true
    }
    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('sent')
      return true
    } catch {
      setStatus('error')
      return false
    }
  }

  return { status, submit, reset: () => setStatus('idle') }
}
