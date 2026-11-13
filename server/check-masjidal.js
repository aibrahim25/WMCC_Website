/**
 * Checks the Masjidal connection using the settings in .env.
 *
 *   npm run check:masjidal              (today)
 *   npm run check:masjidal 2026-11-13   (a specific date)
 */
import { fetchMasjidal, masjidalUrl, normalize } from './masjidal.js'

try {
  process.loadEnvFile()
} catch {
  // Use variables from the shell.
}

const date = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

if (!process.env.MASJID_ID) {
  console.error('MASJID_ID is not set. Create a .env file in the project folder containing: MASJID_ID=your-id')
  process.exit(1)
}

console.log(`Requesting ${masjidalUrl(date, date)}\n`)
try {
  const raw = await fetchMasjidal(date, date)
  console.log('Raw response from Masjidal:\n', JSON.stringify(raw, null, 2), '\n')
  console.log('What the website will use:\n', JSON.stringify(normalize(raw, date), null, 2))
} catch (err) {
  console.error(`Failed: ${err.message}`)
  process.exit(1)
}
