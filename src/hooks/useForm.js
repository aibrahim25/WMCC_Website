import { useCallback, useState } from 'react'

/**
 * Small controlled-form helper.
 *
 * @param {object} initial Initial field values
 * @param {(values: object) => Record<string, string>} validate Returns an error message per invalid field
 */
export function useForm(initial, validate) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})

  /** onChange handler for a field: `<input onChange={field('email')} />` */
  const field = useCallback((name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value })), [])

  /** Runs validation, stores the errors and returns true when the form is valid. */
  const check = () => {
    const next = validate(values)
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const clear = () => {
    setValues(initial)
    setErrors({})
  }

  return { values, errors, field, check, clear }
}
