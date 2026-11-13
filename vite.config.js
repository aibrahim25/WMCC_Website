import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { getPrayerTimes } from './server/prayerTimes.js'

/** Serves /api/prayer-times from the Vite dev server so `npm run dev` works without running server/index.js. */
function devApi(env) {
  return {
    name: 'wmcc-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/prayer-times', async (req, res) => {
        const query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
        const { status, body } = await getPrayerTimes(query, env)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      })
    },
  }
}

// `npm run build` builds the site into dist/, which server/index.js serves in production.
// `npm run build:preview` builds one self-contained HTML file in dist-preview/ (no server, calculated prayer times).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: mode === 'preview' ? [react(), viteSingleFile()] : [react(), devApi(env)],
    build: {
      outDir: mode === 'preview' ? 'dist-preview' : 'dist',
    },
  }
})
