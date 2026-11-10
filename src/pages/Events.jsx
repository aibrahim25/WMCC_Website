import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Segmented from '../components/Segmented'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import Icon from '../components/Icon'
import { useEvents } from '../hooks/useEvents'
import { CATEGORIES, categoryLabel, eventLocation } from '../lib/events'
import { site } from '../lib/site'
import s from './Events.module.css'

export default function Events() {
  const { events } = useEvents()
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const closeEvent = useCallback(() => setActive(null), [])

  const featured = events.find((e) => e.featured)
  const shown = events.filter((e) => filter === 'all' || e.category === filter)

  return (
    <>
      <PageHero
        arabic="وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا"
        title="Community Events"
        lead="Halaqas, classes, youth nights and dinners. Come for one, stay for the people."
      />

      {featured && (
        <section className="container">
          <Reveal className={s.featured}>
            <div className={s.fArt}>
              <span className={s.fBadge}>Featured · {categoryLabel(featured.category)}</span>
              {featured.highlight && (
                <div className={s.fBig}>
                  <span className={s.fNum}>{featured.highlight.value}</span>
                  <span className={s.fNumLabel}>{featured.highlight.label}</span>
                </div>
              )}
              <svg className={s.fRings} viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="60" />
                <circle cx="100" cy="100" r="80" />
                <circle cx="100" cy="100" r="98" />
              </svg>
            </div>
            <div className={s.fBody}>
              <h2 className={s.fTitle}>{featured.title}</h2>
              <p className={s.fWhen}>
                <Icon name="calendar" size={18} /> {featured.schedule}
                <span aria-hidden="true">·</span>
                <Icon name="pin" size={18} /> {eventLocation(featured)}
              </p>
              <p className={s.fDesc}>{featured.description}</p>
              <div className={s.fTags}>
                {featured.tags?.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
              <div className={s.fCtas}>
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Icon name="instagram" size={18} /> See the next date
                </a>
                <Link to="/contact" className="btn btn-outline">
                  Ask a question
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <section className="section container" aria-labelledby="programs-title">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">What's on</span>
            <h2 id="programs-title" className="h2">
              All programs
            </h2>
          </div>
          <Segmented id="cat" label="Filter events" value={filter} onChange={setFilter} options={CATEGORIES} />
        </Reveal>

        <motion.div layout className={s.grid}>
          <AnimatePresence initial={false}>
            {shown.map((ev) => (
              <EventCard key={ev.id} ev={ev} onOpen={setActive} />
            ))}
          </AnimatePresence>
        </motion.div>
        {shown.length === 0 && <p className={s.empty}>Nothing in this category right now. Check back soon.</p>}
      </section>

      <section className="container section-end">
        <div className={s.ctaGrid}>
          <Reveal className={`${s.cta} ${s.ctaDark}`}>
            <h3>Want to help run an event?</h3>
            <p>We always need hands for setup, food, cleanup and teaching. Brothers and sisters both welcome.</p>
            <Link to="/contact" className="btn btn-gold">
              Volunteer with us
            </Link>
          </Reveal>
          <Reveal delay={0.08} className={`${s.cta} ${s.ctaLight}`}>
            <h3>Get the latest dates</h3>
            <p>Flyers and reminders go out on Instagram and Facebook first.</p>
            <div className={s.ctaRow}>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Icon name="instagram" size={18} /> Instagram
              </a>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <Icon name="facebook" size={18} /> Facebook
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <EventModal ev={active} onClose={closeEvent} />
    </>
  )
}
