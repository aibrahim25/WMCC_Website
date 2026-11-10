import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sky from '../components/Sky'
import HeroPrayerCard from '../components/HeroPrayerCard'
import Reveal from '../components/Reveal'
import Icon from '../components/Icon'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import MapCard from '../components/MapCard'
import { useEvents } from '../hooks/useEvents'
import site from '../content/site.json'
import school from '../content/school.json'
import s from './Home.module.css'

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.2, 0.7, 0.2, 1] },
})

const QUICK = [
  { to: '/donate', icon: 'heart', title: 'Give online', body: 'Sadaqah, zakat or the youth fund in under a minute.', cta: 'Donate', g: 'linear-gradient(135deg, #2D4687, #5B70B4)' },
  { to: '/prayer-times', icon: 'clock', title: 'Prayer timetable', body: 'Athan and iqama for the whole month, plus Jumu’ah.', cta: 'See times', g: 'linear-gradient(135deg, #5B70B4, #A59BCB)' },
  { to: '/school', icon: 'book', title: 'Enroll your child', body: 'Sunday School for ages 6 to 15, every Sunday morning.', cta: 'Register', g: 'linear-gradient(135deg, #8E83BF, #E9A58E)' },
  { to: '/contact', icon: 'hands', title: 'Volunteer', body: 'Dinners, cleanup, teaching or the youth team.', cta: 'Get in touch', g: 'linear-gradient(135deg, #E9A58E, #F6C88E)' },
]

const SERVICES = [
  { icon: 'rings', title: 'Nikah', body: 'Marriage ceremonies officiated at the masjid. Reach out a few weeks ahead.', cta: 'Request a nikah' },
  { icon: 'leaf', title: 'Janazah', body: 'Funeral prayer and support for grieving families. Call us right away.', cta: 'Call the masjid' },
  { icon: 'sparkle', title: 'New to Islam', body: 'Questions, shahada, or just curious? We would love to meet you.', cta: 'Talk to us' },
  { icon: 'users', title: 'Counseling', body: 'Private family and personal guidance from trusted members of our community.', cta: 'Book a time' },
]

export default function Home() {
  const { events } = useEvents()
  const upcoming = events.filter((e) => e.next).slice(0, 3)
  const [active, setActive] = useState(null)
  const sundayGroup = school.groups[0]

  return (
    <>
      <Sky variant="home">
        <div className={`container ${s.hero}`}>
          <div className={s.heroText}>
            {site.announcement.enabled && (
              <motion.div {...rise(0)}>
                <Link to={site.announcement.link} className={s.announce}>
                  <span className={s.announceLabel}>{site.announcement.label}</span>
                  <span className={s.announceText}>{site.announcement.text}</span>
                  <Icon name="arrow" size={16} />
                </Link>
              </motion.div>
            )}
            <motion.p className={s.bismillah} lang="ar" {...rise(0.05)}>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </motion.p>
            <motion.h1 className={s.title} {...rise(0.1)}>
              A home for the heart, <em>here in Windham</em>
            </motion.h1>
            <motion.p className={s.heroLead} {...rise(0.18)}>
              Five daily prayers, Sunday School, youth nights and a community that shows up for one another. Everyone is welcome.
            </motion.p>
            <motion.div className={s.heroCtas} {...rise(0.26)}>
              <Link to="/contact" className="btn btn-light">
                Plan your visit
              </Link>
              <Link to="/events" className="btn btn-ghost-light">
                What's on this month
              </Link>
            </motion.div>
          </div>
          <HeroPrayerCard />
        </div>
      </Sky>

      <section className={`container ${s.quick}`} aria-label="Quick links">
        <div className={s.quickGrid}>
          {QUICK.map((q, i) => (
            <Reveal key={q.to} delay={i * 0.06}>
              <Link to={q.to} className={s.quickCard}>
                <span className={s.quickIcon} style={{ background: q.g }}>
                  <Icon name={q.icon} size={22} />
                </span>
                <span className={s.quickTitle}>{q.title}</span>
                <span className={s.quickBody}>{q.body}</span>
                <span className={s.quickCta}>
                  {q.cta} <Icon name="arrow" size={16} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Coming up</span>
            <h2 className="h2">Upcoming at the masjid</h2>
          </div>
          <Link to="/events" className="text-link">
            Full calendar <Icon name="arrow" size={16} />
          </Link>
        </Reveal>
        <div className={s.eventGrid}>
          {upcoming.map((ev) => (
            <EventCard key={ev.id} ev={ev} onOpen={setActive} />
          ))}
        </div>
      </section>

      <section className={`container ${s.schoolWrap}`}>
        <Reveal className={s.school}>
          <div className={s.schoolText}>
            <span className={s.schoolEyebrow}>Islamic Sunday School</span>
            <h2 className={s.schoolTitle}>Quran, Seerah and Arabic for ages 6 to 15</h2>
            <p className={s.schoolLead}>Every Sunday, 10:00 AM to 1:00 PM. Three age groups taught by volunteer teachers from our own community.</p>
            <div className={s.schoolCtas}>
              <Link to="/school" className="btn btn-gold">
                Register online
              </Link>
              <Link to="/school" className="btn btn-ghost-light">
                See all courses
              </Link>
            </div>
          </div>
          <div className={s.schoolDay}>
            <span className={s.schoolDayH}>A Sunday for {sundayGroup.label.toLowerCase()}</span>
            <ol className={s.slots}>
              {sundayGroup.slots.map((slot, i) => (
                <li key={i} className={slot === 'Break' ? s.slotBreak : ''}>
                  <span className="tabular">{school.times[i]}</span>
                  <strong>{slot}</strong>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      <section className="section container">
        <div className={s.welcome}>
          <Reveal className={s.welcomeText}>
            <span className="eyebrow">Services</span>
            <h2 className="h2">Here for life's big moments</h2>
            <p className="lead">From a first visit to a wedding to saying goodbye, the WMCC family is here. Reach out any time and someone will get back to you.</p>
            <Link to="/contact" className="btn btn-primary">
              Contact the masjid
            </Link>
          </Reveal>
          <div className={s.services}>
            {SERVICES.map((sv, i) => (
              <Reveal key={sv.title} delay={i * 0.06} className={s.service}>
                <span className={s.serviceIcon}>
                  <Icon name={sv.icon} size={22} />
                </span>
                <h3>{sv.title}</h3>
                <p>{sv.body}</p>
                <Link to="/contact" className="text-link">
                  {sv.cta} <Icon name="arrow" size={16} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`container ${s.giveWrap}`}>
        <Reveal className={s.give}>
          <div className={s.giveText}>
            <p className={s.giveAr} lang="ar">
              وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ
            </p>
            <h2 className={s.giveTitle}>Keep the lights on at WMCC</h2>
            <p className={s.giveLead}>We run entirely on community support. Your giving covers utilities, school supplies and youth nights. Tax deductible, EIN {site.ein}.</p>
          </div>
          <div className={s.giveActions}>
            {['Sadaqah', 'Zakat', 'Youth fund'].map((f) => (
              <Link key={f} to="/donate" state={{ fund: f }} className={s.giveFund}>
                <span>{f}</span>
                <Icon name="arrow" size={18} />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section container">
        <div className={s.visit}>
          <Reveal className={s.visitText}>
            <span className="eyebrow">Visit</span>
            <h2 className="h2">Come as you are</h2>
            <dl className={s.visitList}>
              <div>
                <dt>Address</dt>
                <dd>
                  {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
                </dd>
              </div>
              <div>
                <dt>Open</dt>
                <dd>For all five daily prayers and Jumu'ah</dd>
              </div>
              <div>
                <dt>Reach us</dt>
                <dd>
                  <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.1} className={s.visitMap}>
            <MapCard tall />
          </Reveal>
        </div>
      </section>

      <EventModal ev={active} onClose={() => setActive(null)} />
    </>
  )
}
