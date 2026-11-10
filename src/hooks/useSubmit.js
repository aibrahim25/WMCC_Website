import { useCallback, useState } from 'react'

const DEMO_DELAY_MS = 700

/**
 * Submits form data to Formspree (https://formspree.io).
 *
 * Without a form ID the hook runs in demo mode: it waits briefly and reports success without sending anything.
 *
 * @param {string} formId Formspree form ID from `site.json → integrations`
 * @returns {{ status: 'idle'|'sending'|'sent'|'error', submit: (data: object) => Promise<boolean>, reset: () => void }}
 */
export function useSubmit(formId) {
  const [status, setStatus] = useState('idle')

  const submit = useCallback(
    async (data) => {
      setStatus('sending')
      if (!formId) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS))
        setStatus('sent')
        return true
      }
      try {
        const res = await fetch(`https://formspree.io/f/${formId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(`Formspree returned ${res.status}`)
        setStatus('sent')
        return true
      } catch {
        setStatus('error')
        return false
      }
    },
    [formId],
  )

  const reset = useCallback(() => setStatus('idle'), [])

  return { status, submit, reset }
}
