# WMCC Website

Source code for [wmccmosque.org](https://wmccmosque.org), the website of the Windham Muslim Community Center in
Londonderry, NH.

It's a React single-page app with a small Node.js server. The site has prayer times from the masjid's Masjidal
schedule, an events calendar, Sunday School info and registration, a contact form and a donation page. Day-to-day
content lives in JSON files so it can be changed without touching components.

## Tech stack

- [React 18](https://react.dev) with [Vite 5](https://vitejs.dev)
- [React Router 6](https://reactrouter.com) for page routing
- CSS Modules, with shared design tokens in `src/styles/global.css`
- [Framer Motion](https://www.framer.com/motion/) for animation (respects the visitor's reduced-motion setting)
- [Express](https://expressjs.com) server that serves the site and the prayer-times API
- ESLint and Prettier for code quality

Forms post to [Formspree](https://formspree.io) and donations hand off to an external payment page.

## Getting started

Requires Node.js 20.12 or newer (see `.nvmrc`).

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173 and serves the API too. Without a `.env` file the site still works, using
calculated prayer times. To use live Masjidal times locally, create a `.env` file in the project root containing
`MASJID_ID=your-id`.

### Scripts

| Command                  | What it does                                                               |
| ------------------------ | -------------------------------------------------------------------------- |
| `npm run dev`            | Start the dev server with hot reload (site and API)                        |
| `npm run build`          | Production build of the site into `dist/`                                  |
| `npm start`              | Run the production server (serves `dist/` and the API). Build first.       |
| `npm run check:masjidal` | Show what Masjidal returns for today (or a date: `-- 2026-11-13`)          |
| `npm run build:preview`  | Build the whole site as one self-contained HTML file in `dist-preview/`    |
| `npm run lint`           | Run ESLint                                                                 |
| `npm run format`         | Format all files with Prettier                                             |
| `npm run check`          | Lint, check formatting and build. Run this before committing or deploying. |

## Project structure

```
index.html              HTML shell, meta tags and fonts
server/
  index.js              Production server: serves dist/ and /api
  prayerTimes.js        GET /api/prayer-times: validation and caching
  masjidal.js           Masjidal request and response conversion
  check-masjidal.js     `npm run check:masjidal`
public/
  favicon.svg
src/
  main.jsx              Entry point
  App.jsx               Router, route table, page titles and page transitions
  content/              Editable site content (see below)
  pages/                One component per route, each with its own CSS module
  components/           Shared UI: Navbar, Footer, Sky, EventCard, EventModal, Segmented, ...
  hooks/
    usePrayerTimes.js   Today's times and a live countdown to the next prayer
    useEvents.js        Events with their next date, from JSON or a Google Sheet
    useSubmit.js        Formspree submission with a demo mode
    useForm.js          Controlled form values and validation
    useNow.js           Ticking clock
  lib/
    site.js             Access to site.json and address helpers
    prayer.js           Prayer time calculation and time-zone-aware date helpers
    prayerSchedule.js   Loads live prayer times from the API, with calculated times as fallback
    events.js           Recurrence rules, time formatting, Google Calendar links, CSV import
    format.js           Small shared formatters and validators
  styles/global.css     Design tokens, typography, buttons, form fields and layout helpers
```

### How it works

- **Prayer times** come from the masjid's [Masjidal](https://masjidal.com) schedule. The browser calls
  `/api/prayer-times?from=YYYY-MM-DD&to=YYYY-MM-DD` on our server, which fetches from Masjidal and caches the result
  for 15 minutes, so the Masjid ID and any API key never reach the browser. Until the live times arrive, or if the API
  is unreachable, the page shows times calculated on the visitor's device (ISNA method), so it never gets stuck
  loading. All times are shown in the masjid's time zone (`America/New_York`) whatever the visitor's device is set to.
- **Events** are stored with a recurrence rule rather than fixed dates. `lib/events.js` works out each event's next
  date, so the calendar never goes stale.
- **Routing** uses `BrowserRouter`. The server answers every non-API path with `index.html`, so links like `/events`
  work on refresh. The single-file preview build uses an in-memory router instead (set by `.env.preview`).

## Editing content

Everything the board changes often is in `src/content/`. After editing, rebuild and redeploy.

| File          | Contents                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.json`   | Name, phone, email, address, social links, prayer settings, homepage announcement, integrations                                                                                    |
| `events.json` | Events and classes                                                                                                                                                                 |
| `school.json` | Sunday School facts, courses and the weekly schedule. Each group has one slot per entry in `times`: `{ "name": "Arabic", "teacher": "Sr. Fadiah" }`, or `"break": true` for breaks |
| `donate.json` | Donation funds shown on the Donate page (`icon` is an icon name). The first three also appear on the home page.                                                                    |

### Events (`events.json`)

| Field          | Required | Notes                                                                                     |
| -------------- | -------- | ----------------------------------------------------------------------------------------- |
| `id`           | yes      | Unique, URL-safe                                                                          |
| `title`        | yes      |                                                                                           |
| `category`     | yes      | `youth`, `classes`, `sisters` or `community`                                              |
| `schedule`     | yes      | Human-readable, e.g. "Third Friday of each month"                                         |
| `recurrence`   | yes      | See below                                                                                 |
| `start`, `end` | no       | 24-hour `"HH:MM"`. Adding `start` shows the time and an **Add to Google Calendar** button |
| `audience`     | no       | e.g. "For sisters"                                                                        |
| `location`     | no       | Defaults to "WMCC, Londonderry NH"                                                        |
| `description`  | no       | Shown in the event dialog                                                                 |
| `tags`         | no       | Array of short labels                                                                     |
| `link`         | no       | A page on this site to link from the dialog, e.g. `"/school"`                             |
| `instagram`    | no       | Instagram page for this program. Adds a **Follow on Instagram** button.                   |
| `featured`     | no       | `true` shows the event in the large card at the top of the Events page                    |
| `highlight`    | no       | `{ "value": "14–25", "label": "years old" }`: the big figure on the featured card         |

Recurrence rules:

| `recurrence`                                | Meaning                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `{ "type": "weekly", "weekday": 5 }`        | Every week on that day (0 = Sunday … 6 = Saturday)       |
| `{ "type": "nth", "weekday": 5, "nth": 3 }` | The 3rd Friday of each month. Use `-1` for the last one. |
| `{ "type": "date", "date": "2027-03-20" }`  | A one-off event. It disappears after the date passes.    |
| `{ "type": "none" }`                        | No fixed date. Shown as "Ongoing".                       |

### Managing events from a Google Sheet (no rebuild needed)

1. Create a Google Sheet with these column headers:
   `id, title, category, audience, schedule, recurrence, weekday, nth, date, start, end, location, description, tags, featured, link`
   - `recurrence`: `weekly`, `nth`, `date` or `none`
   - `weekday`: Sunday … Saturday
   - `tags`: separated with `|`, e.g. `Halaqa|Food`
   - `featured`: `yes` or `no`
2. **File → Share → Publish to web**, choose the sheet and **CSV**, then publish and copy the link.
3. Paste the link into `site.json → integrations.eventsSheetCsv` and deploy once.

From then on the site reads events straight from the sheet. If the sheet can't be loaded, it falls back to
`events.json`.

## Server settings (environment variables)

Set these in a `.env` file in the project root locally (one `NAME=value` per line; it is git-ignored) and in the
Node.js app's environment variables on Hostinger.

| Variable           | Required | Purpose                                                                                 |
| ------------------ | -------- | --------------------------------------------------------------------------------------- |
| `MASJID_ID`        | yes      | Your masjid's ID from your Masjidal account. Without it the site uses calculated times. |
| `MASJIDAL_API_KEY` | no       | Only if Masjidal issues you a key. Sent as a Bearer token.                              |
| `MASJIDAL_URL`     | no       | Overrides the Masjidal request URL. `{id}`, `{from}` and `{to}` are filled in.          |
| `PORT`             | no       | Server port. Hostinger sets it automatically. Defaults to 3000.                         |

Masjidal's API is not publicly documented. If `npm run check:masjidal` shows a different response format, update
`normalize()` in `server/masjidal.js`; nothing else needs to change.

## Integrations

These settings are in `site.json → integrations`. Each one is optional, and the site works without it.

| Setting                 | Purpose                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `formspreeId`           | Contact form. Create a form at formspree.io and paste the ID (the part after `/f/`).                    |
| `schoolFormspreeId`     | Sunday School registration. Falls back to `formspreeId`.                                                |
| `newsletterFormspreeId` | Footer newsletter sign-up                                                                               |
| `donateUrl`             | The masjid's Masjidal donation page (must start with `https://`). The **Donate now** button opens it.   |
| `eventsSheetCsv`        | Published Google Sheet CSV for events (see above)                                                       |
| `prayerTimesApi`        | Path of the prayer-times API. Leave as `/api/prayer-times`; set to `""` to always use calculated times. |

Without a Formspree ID, a form runs in demo mode: it shows the success message but sends nothing. Without a
`donateUrl`, the Donate page says online giving is opening soon.

## Deployment (Hostinger Node.js app)

The site runs as a Node.js app (Business plan or higher). In hPanel, add a **Node.js app**, connect this GitHub
repository (or upload the project without `node_modules`), and use these settings:

| Setting          | Value                          |
| ---------------- | ------------------------------ |
| Node.js version  | 22                             |
| Build command    | `npm run build`                |
| Start command    | `npm start`                    |
| Environment vars | `MASJID_ID` (and others above) |

Run `npm run check` before deploying. After deploying, open `/api/health` (it should return `{"ok":true}`), then
`/api/prayer-times?from=YYYY-MM-DD` with today's date to confirm the Masjidal connection.

## Conventions

- Function components and hooks only. Shared logic goes in `hooks/` or `lib/`, not in page files.
- One CSS module per component. Colours, fonts and spacing come from the custom properties in `global.css`.
- Copy that changes often belongs in `src/content/`, not in JSX.
- Formatting is enforced by Prettier (no semicolons, single quotes, 120 columns).
