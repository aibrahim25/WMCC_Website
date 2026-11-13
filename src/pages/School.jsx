import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Segmented from '../components/Segmented'
import Icon from '../components/Icon'
import FormSuccess from '../components/FormSuccess'
import { useForm } from '../hooks/useForm'
import { useSubmit } from '../hooks/useSubmit'
import { isEmail } from '../lib/format'
import { site } from '../lib/site'
import school from '../content/school.json'
import s from './School.module.css'

/** Header gradients for the course cards, cycled in order. */
const BANDS = [
  'linear-gradient(120deg, #18245A, #3E5A9E)',
  'linear-gradient(120deg, #2D4687, #8E83BF)',
  'linear-gradient(120deg, #5B70B4, #C98A8A)',
  'linear-gradient(120deg, #8E83BF, #D9876E)',
  'linear-gradient(120deg, #C98A8A, #F6C88E)',
]

const FEATURES = [
  {
    icon: 'book',
    title: 'A full curriculum',
    body: "Structured classes covering Qur'an Studies, Islamic Studies and Arabic, ending with salah together.",
  },
  {
    icon: 'users',
    title: 'Dedicated volunteer teachers',
    body: 'Qualified instructors from our own community who know the kids by name.',
  },
  {
    icon: 'sparkle',
    title: 'Hands-on learning',
    body: 'An engaging classroom where kids ask questions, discuss and take part.',
  },
]

function Schedule() {
  const [group, setGroup] = useState(school.groups[0].id)
  const g = school.groups.find((x) => x.id === group)
  return (
    <section id="schedule" className="container">
      <Reveal className={s.schedule}>
        <div className={s.schedHead}>
          <div>
            <span className={s.schedKicker}>Class schedule</span>
            <h2 className={s.schedTitle}>A typical Sunday</h2>
          </div>
          <Segmented
            id="group"
            tone="dark"
            label="Group"
            value={group}
            onChange={setGroup}
            options={school.groups.map(({ id, label }) => ({ id, label }))}
          />
        </div>
        <div className={s.slots}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ol
              key={group}
              className={s.slotList}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {g.slots.map((slot, i) => (
                <motion.li
                  key={school.times[i]}
                  className={`${s.slot} ${slot.break ? s.slotBreak : ''}`}
                  variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={`${s.slotTime} tabular`}>{school.times[i]}</span>
                  <span className={s.slotName}>{slot.name}</span>
                  {slot.teacher && <span className={s.slotTeacher}>{slot.teacher}</span>}
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  )
}

const EMPTY_REGISTRATION = { child: '', age: '', parent: '', phone: '', email: '', notes: '' }

function validateRegistration(v) {
  const errors = {}
  if (!v.child.trim()) errors.child = "Enter your child's name"
  if (!v.age.trim()) errors.age = "Enter your child's age"
  if (!v.parent.trim()) errors.parent = 'Enter a parent or guardian name'
  if (!isEmail(v.email)) errors.email = 'Enter an email like name@example.com'
  return errors
}

function Registration() {
  const { values: form, errors, field: set, check, clear } = useForm(EMPTY_REGISTRATION, validateRegistration)
  const { status, submit, reset } = useSubmit(site.integrations.schoolFormspreeId || site.integrations.formspreeId)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!check()) return
    await submit({ ...form, _subject: `Sunday School registration: ${form.child}` })
  }

  return (
    <section id="register" className="section container">
      <div className={s.reg}>
        <Reveal className={s.regIntro}>
          <span className="eyebrow">Registration</span>
          <h2 className="h2">Enroll your child</h2>
          <p className="lead">
            {school.registrationOpen
              ? 'Fill out the form and the school team will follow up by email with next steps.'
              : 'Registration is closed for this school year.'}
          </p>
          <div className={s.regHelp}>
            <strong>Questions?</strong>
            <a href={`tel:${site.phoneHref}`}>
              <Icon name="phone" size={18} /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`}>
              <Icon name="mail" size={18} /> {site.email}
            </a>
            <Link to="/contact" className="text-link">
              Send us a message <Icon name="arrow" size={16} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.08} className={s.regCard}>
          {!school.registrationOpen ? (
            <div className={s.form}>
              <h3>Registration is closed</h3>
              <p>
                Registration for this school year has closed. Contact us to ask about the waiting list or next year's
                registration.
              </p>
              <Link to="/contact" className="btn btn-primary">
                Contact us
              </Link>
            </div>
          ) : status === 'sent' ? (
            <FormSuccess
              title="JazakAllahu khair!"
              body="We got your registration. The school team will email you soon with next steps."
              actionLabel="Register another child"
              onReset={() => {
                clear()
                reset()
              }}
            />
          ) : (
            <form onSubmit={onSubmit} noValidate className={s.form}>
              <div className="form-grid">
                <label className="field" htmlFor="reg-child">
                  Child's full name
                  <input
                    id="reg-child"
                    className="input"
                    value={form.child}
                    onChange={set('child')}
                    aria-invalid={!!errors.child}
                    autoComplete="off"
                  />
                  {errors.child && <span className="field-error">{errors.child}</span>}
                </label>
                <label className="field" htmlFor="reg-age">
                  Child's age
                  <input
                    id="reg-age"
                    className="input"
                    inputMode="numeric"
                    value={form.age}
                    onChange={set('age')}
                    aria-invalid={!!errors.age}
                  />
                  {errors.age && <span className="field-error">{errors.age}</span>}
                </label>
                <label className="field" htmlFor="reg-parent">
                  Parent or guardian
                  <input
                    id="reg-parent"
                    className="input"
                    value={form.parent}
                    onChange={set('parent')}
                    aria-invalid={!!errors.parent}
                    autoComplete="name"
                  />
                  {errors.parent && <span className="field-error">{errors.parent}</span>}
                </label>
                <label className="field" htmlFor="reg-phone">
                  Phone <span className="hint">Optional</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="input"
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                  />
                </label>
              </div>
              <label className="field" htmlFor="reg-email">
                Email
                <input
                  id="reg-email"
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={set('email')}
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </label>
              <label className="field" htmlFor="reg-notes">
                <span>
                  Anything we should know? <span className="hint">Allergies, Quran level, siblings enrolling</span>
                </span>
                <textarea id="reg-notes" className="input" rows={4} value={form.notes} onChange={set('notes')} />
              </label>
              {status === 'error' && (
                <p className="field-error">That didn't go through. Please try again, or call us at {site.phone}.</p>
              )}
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Submit registration'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default function School() {
  return (
    <>
      <PageHero
        arabic="رَّبِّ زِدْنِي عِلْمًا"
        title="Islamic Sunday School"
        lead="Strong foundations in Quran, faith and character for kids ages 6 to 15."
      >
        <a href="#register" className="btn btn-light">
          {school.registrationOpen ? 'Register your child' : 'Registration info'}
        </a>
        <a href="#schedule" className="btn btn-ghost-light">
          View class schedule
        </a>
      </PageHero>

      <section className="container">
        <Reveal className={s.facts}>
          {school.facts.map((f) => (
            <div key={f.label} className={s.fact}>
              <span>{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section container">
        <div className={s.features}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={s.feature}>
              <span className={s.featureIcon}>
                <Icon name={f.icon} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section-end">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Our courses</span>
            <h2 className="h2">What your child will learn</h2>
          </div>
        </Reveal>
        <div className={s.courses}>
          {school.courses.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 0.06} as="article" className={s.course}>
              <div className={s.courseBand} style={{ background: BANDS[i % BANDS.length] }}>
                <span lang="ar">{c.arabic}</span>
              </div>
              <div className={s.courseBody}>
                <h3>{c.title}</h3>
                <span className={s.teacher}>Taught by {c.teacher}</span>
                <ul>
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Schedule />
      <Registration />
    </>
  )
}
