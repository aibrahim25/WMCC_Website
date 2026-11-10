/** Zero-pads a number to two digits: 7 → "07". */
export const pad2 = (n) => String(n).padStart(2, '0')

/** Loose email check used by the site's forms. Real validation happens on the form service. */
export const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim())
