# WMCC Website

Source code for [wmccmosque.org](https://wmccmosque.org), the website of the Windham Muslim Community Center in
Londonderry, NH.

It's a static single-page app: daily prayer times calculated in the browser, an events calendar, Sunday School info
and registration, a contact form and a donation page. Day-to-day content lives in JSON files so it can be changed
without touching components.

## Tech stack

- [React 18](https://react.dev) with [Vite 5](https://vitejs.dev)
- [React Router 6](https://reactrouter.com) for page routing
- CSS Modules, with shared design tokens in `src/styles/global.css`
- [Framer Motion](https://www.framer.com/motion/) for animation (respects the visitor's reduced-motion setting)
- ESLint and Prettier for code quality

There is no backend. Forms post to [Formspree](https://formspree.io) and donations hand off to an external payment page.

## Getting started

Requires Node.js 18.18 or newer (see `.nvmrc`).

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

### Scripts

| Command                 | What it does                                                               |
| ----------------------- | -------------------------------------------------------------------------- |
| `npm run dev`           | Start the dev server with hot reload (`npm start` does the same)           |
| `npm run build`         | Production build into `dist/`                                              |
| `npm run preview`       | Serve the production build locally                                         |
| `npm run build:preview` | Build the whole site as one self-contained HTML file in `dist-preview/`    |
| `npm run lint`          | Run ESLint                                                                 |
| `npm run format`        | Format all files with Prettier                                             |
| `npm run check`         | Lint, check formatting and build. Run this before committing or deploying. |

## Project structure

```
index.html              HTML shell, meta tags and fonts
public/
  .htaccess             Apache rewrite rules so deep links work on Hostinger
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
    events.js           Recurrence rules, time formatting, Google Calendar links, CSV import
    format.js           Small shared formatters and validators
  styles/global.css     Design tokens, typography, buttons, form fields and layout helpers
```

### How it works

- **Prayer times** are calculated on the visitor's device with the ISNA method for the coordinates in `site.json`.
  There is no API call, so the times always load. All dates and times are shown in the masjid's time zone
  (`America/New_York`) whatever the visitor's device is set to.
- **Events** are stored with a recurrence rule rather than fixed dates. `lib/events.js` works out each event's next
  date, so the calendar never goes stale.
- **Routing** uses `BrowserRouter`. The `.htaccess` file sends unknown paths to `index.html` so links like
  `/events` work on refresh. The single-file preview build uses an in-memory router instead (set by `.env.preview`).

## Editing content

Everything the board changes often is in `src/content/`. After editing, rebuild and redeploy.

| File          | Contents                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.json`   | Name, phone, email, address, social links, prayer settings, homepage announcement, integrations                                                                                    |
| `events.json` | Events and classes                                                                                                                                                                 |
| `school.json` | Sunday School facts, courses and the weekly schedule. Each group has one slot per entry in `times`: `{ "name": "Arabic", "teacher": "Sr. Fadiah" }`, or `"break": true` for breaks |
| `donate.json` | Donation funds and preset amounts. The first three funds also appear on the home page.                                                                                             |

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

## Integrations

All integration settings are in `site.json → integrations`. Each one is optional, and the site works without it.

| Setting                 | Purpose                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `formspreeId`           | Contact form. Create a form at formspree.io and paste the ID (the part after `/f/`).                                         |
| `schoolFormspreeId`     | Sunday School registration. Falls back to `formspreeId`.                                                                     |
| `newsletterFormspreeId` | Footer newsletter sign-up                                                                                                    |
| `donateUrl`             | Payment page (Stripe Payment Link, PayPal, LaunchGood, ...). `fund`, `amount` and `frequency` are added as query parameters. |
| `eventsSheetCsv`        | Published Google Sheet CSV for events (see above)                                                                            |

Without a Formspree ID, a form runs in demo mode: it shows the success message but sends nothing. Without a
`donateUrl`, the Donate page says online checkout is opening soon.

## Deployment (Hostinger)

1. Run `npm run check`. It must pass.
2. In Hostinger File Manager, open `public_html` and upload **everything inside `dist/`**, including the hidden
   `.htaccess` file.

`.htaccess` handles client-side routes and sets long cache lifetimes for the hashed asset files.

## Conventions

- Function components and hooks only. Shared logic goes in `hooks/` or `lib/`, not in page files.
- One CSS module per component. Colours, fonts and spacing come from the custom properties in `global.css`.
- Copy that changes often belongs in `src/content/`, not in JSX.
- Formatting is enforced by Prettier (no semicolons, single quotes, 120 columns).
