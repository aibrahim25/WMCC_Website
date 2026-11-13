/**
 * Production server: serves the built site from dist/ and the /api endpoints.
 *
 *   npm run build && npm start
 *
 * Settings come from environment variables (see README). A local .env file is loaded if present.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { getPrayerTimes } from './prayerTimes.js'

try {
  process.loadEnvFile()
} catch {
  // No .env file: use the environment set by the host.
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const port = Number(process.env.PORT) || 3000

const app = express()
app.disable('x-powered-by')

app.get('/api/prayer-times', async (req, res) => {
  const { status, body } = await getPrayerTimes(req.query)
  if (status === 200) res.set('Cache-Control', 'public, max-age=900')
  res.status(status).json(body)
})

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Hashed build assets never change, so browsers can cache them for a year.
app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }))
app.use(express.static(distDir, { index: false }))

// Every other path is a page of the single-page app.
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => console.log(`WMCC site running on http://localhost:${port}`))
