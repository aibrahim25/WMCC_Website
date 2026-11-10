import site from '../content/site.json'

export { site }

/** "27 Roulston Rd, Windham, NH 03087" */
export const fullAddress = (a = site.address) => `${a.street}, ${a.city}, ${a.state} ${a.zip}`

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`
