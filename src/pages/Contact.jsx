import { useEffect, useRef, useState } from 'react'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Icon from '../components/Icon'
import MapCard from '../components/MapCard'
import FormSuccess from '../components/FormSuccess'
import { useForm } from '../hooks/useForm'
import { useSubmit } from '../hooks/useSubmit'
import { isEmail } from '../lib/format'
import { MAPS_URL, site } from '../lib/site'
import s from './Contact.module.css'

const TOPICS = ['General', 'Sunday School', 'Youth Program', 'New to Islam', 'Volunteer', 'Donations']
const COPIED_MS = 1800

const EMPTY_FORM = { topic: TOPICS[0], name: '', email: '', phone: '', message: '' }

function validate(v) {
  const errors = {}
  if (!v.name.trim()) errors.name = 'Enter your name'
  if (!isEmail(v.email)) errors.email = 'Enter an email like name@example.com'
  if (v.message.trim().length < 5) errors.message = 'Write a short message so we know how to help'
  return errors
}

/** Copies `text` to the clipboard and briefly shows "Copied". */
function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type="button" className={s.copy} onClick={onClick} aria-label={`Copy ${label}`}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ContactForm() {
  const { values: form, errors, field: set, check, clear } = useForm(EMPTY_FORM, validate)
  const { status, submit, reset } = useSubmit(site.integrations.formspreeId)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!check()) return
    await submit({ ...form, _subject: `Website message: ${form.topic}` })
  }

  if (status === 'sent') {
    return (
      <FormSuccess
        title="Message sent"
        body="JazakAllahu khair. Someone from WMCC will get back to you soon. For anything urgent, please call."
        actionLabel="Send another message"
        onReset={() => {
          clear()
          reset()
        }}
      />
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className={s.form}>
      <div>
        <h2 className={s.formTitle}>Send us a message</h2>
        <p className={s.formLead}>Pick a topic so it reaches the right person.</p>
      </div>
      <fieldset className={s.topics}>
        <legend className="sr-only">Topic</legend>
        {TOPICS.map((t) => (
          <label key={t} className={`${s.topic} ${form.topic === t ? s.topicOn : ''}`}>
            <input
              type="radio"
              name="topic"
              value={t}
              checked={form.topic === t}
              onChange={set('topic')}
              className="sr-only"
            />
            {t}
          </label>
        ))}
      </fieldset>
      <div className="form-grid">
        <label className="field" htmlFor="c-name">
          Your name
          <input
            id="c-name"
            className="input"
            value={form.name}
            onChange={set('name')}
            aria-invalid={!!errors.name}
            autoComplete="name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label className="field" htmlFor="c-email">
          Email
          <input
            id="c-email"
            type="email"
            className="input"
            value={form.email}
            onChange={set('email')}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
      </div>
      <label className="field" htmlFor="c-phone">
        <span>
          Phone <span className="hint">Optional</span>
        </span>
        <input
          id="c-phone"
          type="tel"
          className="input"
          value={form.phone}
          onChange={set('phone')}
          autoComplete="tel"
        />
      </label>
      <label className="field" htmlFor="c-message">
        Message
        <textarea
          id="c-message"
          className="input"
          rows={5}
          value={form.message}
          onChange={set('message')}
          aria-invalid={!!errors.message}
        />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </label>
      {status === 'error' && (
        <p className="field-error">That didn't go through. Please try again, or call us at {site.phone}.</p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : `Send message · ${form.topic}`}
      </button>
    </form>
  )
}

export default function Contact() {
  const a = site.address
  return (
    <>
      <PageHero
        arabic="السَّلَامُ عَلَيْكُمْ"
        title="Contact Us"
        lead="Questions, a visit or something urgent. We're here to help."
      />

      <section className="container">
        <div className={s.cards}>
          <Reveal className={s.card}>
            <span className={s.icon}>
              <Icon name="pin" />
            </span>
            <span className={s.label}>Visit</span>
            <span className={s.value}>
              {a.street}
              <br />
              {a.city}, {a.state} {a.zip}
            </span>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-link">
              Get directions <Icon name="arrow" size={16} />
            </a>
          </Reveal>
          <Reveal delay={0.05} className={s.card}>
            <span className={s.icon}>
              <Icon name="phone" />
            </span>
            <span className={s.label}>Call</span>
            <span className={s.value}>{site.phone}</span>
            <div className={s.row}>
              <a href={`tel:${site.phoneHref}`} className="text-link">
                Call now <Icon name="arrow" size={16} />
              </a>
              <CopyButton text={site.phone} label="phone number" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className={s.card}>
            <span className={s.icon}>
              <Icon name="mail" />
            </span>
            <span className={s.label}>Email</span>
            <span className={s.value}>{site.email}</span>
            <div className={s.row}>
              <a href={`mailto:${site.email}`} className="text-link">
                Write to us <Icon name="arrow" size={16} />
              </a>
              <CopyButton text={site.email} label="email address" />
            </div>
          </Reveal>
          <Reveal delay={0.15} className={`${s.card} ${s.cardFollow}`}>
            <span className={s.icon}>
              <Icon name="instagram" />
            </span>
            <span className={s.label}>Follow</span>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className={s.social}>
              Instagram
            </a>
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className={s.social}>
              Facebook
            </a>
          </Reveal>
        </div>
      </section>

      <section className="section container">
        <div className={s.main}>
          <Reveal className={s.formCard}>
            <ContactForm />
          </Reveal>
          <div className={s.side}>
            <Reveal delay={0.05} className={s.urgent}>
              <span className={s.urgentKicker}>Something urgent?</span>
              <p className={s.urgentText}>Please call us directly instead of using the form.</p>
              <a href={`tel:${site.phoneHref}`} className="btn btn-gold">
                <Icon name="phone" size={18} /> {site.phone}
              </a>
            </Reveal>
            <Reveal delay={0.1} className={s.tips}>
              <h3>First time visiting?</h3>
              <ul>
                <li>Everyone is welcome, Muslim or not.</li>
                <li>Modest clothing is appreciated.</li>
                <li>Shoes come off before the prayer area.</li>
                <li>Not sure where to go? Just ask anyone.</li>
              </ul>
            </Reveal>
            <Reveal delay={0.15} className={s.ramadan}>
              <h3>Ramadan hours</h3>
              <p>
                During Ramadan the masjid is open for iftar and tarawih. Please call ahead to confirm other services.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container section-end">
        <Reveal>
          <MapCard tall />
        </Reveal>
      </section>
    </>
  )
}
