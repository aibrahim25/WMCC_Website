# WMCC Website

React site for the Windham Muslim Community Center. Built with Vite, React Router v6, CSS Modules and Framer Motion.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Put it live on Hostinger

1. `npm run build` (makes a `dist/` folder)
2. In Hostinger File Manager, open `public_html` and upload **everything inside `dist/`**, including the hidden `.htaccess` file.
3. The `.htaccess` file makes links like `wmccmosque.org/events` work when someone refreshes or shares them.

If you only want to update the site, you can also upload `wmcc-dist.zip` and extract it in `public_html`.

## Edit content without touching code

Everything the board changes often lives in `src/content/`:

| File | What's in it |
| --- | --- |
| `site.json` | Phone, email, address, social links, Jumu'ah times, iqama offsets, the announcement pill on the homepage, integrations |
| `events.json` | All events and classes |
| `school.json` | Sunday School facts, courses, teachers and the schedule |

After editing, run `npm run build` again and re-upload.

### Event repeat rules (`events.json`)

| `recurrence` | Meaning | Example |
| --- | --- | --- |
| `{ "type": "weekly", "weekday": 5 }` | Every week on that day (0 = Sunday … 6 = Saturday) | Jumu'ah |
| `{ "type": "nth", "weekday": 5, "nth": 3 }` | The 3rd Friday of each month. Use `-1` for "last" | Monthly Halaqa |
| `{ "type": "date", "date": "2027-03-20" }` | One-off event. It hides itself after the date passes | Eid prayer |
| `{ "type": "none" }` | No fixed date (shows "Ongoing") | Book club |

Add `"start": "19:00"` and `"end": "21:00"` (24-hour) to show times and an **Add to Google Calendar** button. Add `"featured": true` to show an event in the big card on the Events page.

### Let the board edit events from a Google Sheet (no rebuild needed)

1. Make a Google Sheet with these column headers:
   `id, title, category, audience, schedule, recurrence, weekday, nth, date, start, end, location, description, tags, featured, link`
   - `category`: youth, classes, sisters or community
   - `recurrence`: weekly, nth, date or none
   - `weekday`: Sunday … Saturday
   - `tags`: separated with `|` (e.g. `Halaqa|Food`)
   - `featured`: yes or no
2. File → Share → Publish to web → choose the sheet, format **CSV** → Publish. Copy the link.
3. Paste it into `site.json` → `integrations.eventsSheetCsv` and rebuild once.

From then on the site reads events straight from the sheet. If the sheet can't load, it falls back to `events.json`.

## Make the forms send email (Formspree, free tier)

1. Create a free account at formspree.io and make a form. Copy its ID (the part after `/f/`).
2. Paste it into `site.json`:
   - `formspreeId`: contact form
   - `schoolFormspreeId`: Sunday School registration (optional, falls back to the contact form)
   - `newsletterFormspreeId`: newsletter signups

Until an ID is set, the forms run in demo mode and only show the success screen.

## Turn on online giving

Set `integrations.donateUrl` in `site.json` to your payment page (Stripe Payment Link, PayPal, LaunchGood, etc.). The Donate button sends people there with the chosen fund, amount and frequency added to the link. Until it's set, the page says online checkout is opening soon.

## Prayer times

Calculated right in the browser with the ISNA method for Windham (no outside API, so they never get stuck loading). Change angles, iqama offsets or Jumu'ah times in `site.json` → `prayer`.

## Folder map

```
src/
  content/     site.json, events.json, school.json   ← edit these
  pages/       Home, PrayerTimes, Events, School, Contact, Donate, NotFound
  components/  Navbar, Footer, Sky (animated sunset), HeroPrayerCard, EventCard, EventModal, ...
  hooks/       usePrayerTimes, useEvents, useSubmit
  lib/         prayer.js (time math), events.js (repeat rules, calendar links, CSV)
  styles/      global.css (colors, fonts, buttons, forms)
```
