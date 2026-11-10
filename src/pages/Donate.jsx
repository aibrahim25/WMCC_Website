import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Segmented from '../components/Segmented'
import Icon from '../components/Icon'
import site from '../content/site.json'
import s from './Donate.module.css'

const FUNDS = [
  { id: 'Sadaqah', title: 'Sadaqah', body: 'General support for the masjid: utilities, upkeep and daily operations.' },
  { id: 'Zakat', title: 'Zakat', body: 'Your obligatory zakat, distributed to those eligible in our community.' },
  { id: 'Youth fund', title: 'Youth fund', body: 'Youth nights, outings and supplies for ages 14 to 25.' },
  { id: 'Sunday School', title: 'Sunday School', body: 'Books, classroom supplies and teacher support.' },
]
const AMOUNTS = [25, 50, 100, 250, 500]

export default function Donate() {
  const { state } = useLocation()
  const [fund, setFund] = useState(FUNDS.some((f) => f.id === state?.fund) ? state.fund : 'Sadaqah')
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const [freq, setFreq] = useState('once')

  const value = custom ? Math.max(0, Math.round(Number(custom) || 0)) : amount
  const url = site.integrations.donateUrl
  const checkoutUrl = url ? `${url}${url.includes('?') ? '&' : '?'}fund=${encodeURIComponent(fund)}&amount=${value}&frequency=${freq}` : ''

  return (
    <>
      <PageHero arabic="وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ" title="Support WMCC" lead="Whatever good you give benefits your own self. Every gift keeps our masjid open for prayer, learning and community." />

      <section className="container" style={{ paddingBottom: 'clamp(64px, 9vw, 104px)' }}>
        <div className={s.layout}>
          <Reveal className={s.builder}>
            <div className={s.step}>
              <h2 className={s.stepH}>Choose a fund</h2>
              <div className={s.funds} role="radiogroup" aria-label="Fund">
                {FUNDS.map((f) => (
                  <button key={f.id} type="button" role="radio" aria-checked={fund === f.id} className={`${s.fund} ${fund === f.id ? s.fundOn : ''}`} onClick={() => setFund(f.id)}>
                    <span className={s.fundTop}>
                      <strong>{f.title}</strong>
                      <span className={s.radio} aria-hidden="true">
                        {fund === f.id && <motion.span layoutId="fund-dot" className={s.dot} />}
                      </span>
                    </span>
                    <span className={s.fundBody}>{f.body}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={s.step}>
              <h2 className={s.stepH}>Choose an amount</h2>
              <div className={s.amounts} role="radiogroup" aria-label="Amount">
                {AMOUNTS.map((a) => {
                  const on = !custom && amount === a
                  return (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`${s.amount} ${on ? s.amountOn : ''}`}
                      onClick={() => {
                        setAmount(a)
                        setCustom('')
                      }}
                    >
                      ${a}
                    </button>
                  )
                })}
              </div>
              <label className={`field ${s.custom}`} htmlFor="d-custom">
                Or enter another amount
                <span className={s.customWrap}>
                  <span aria-hidden="true">$</span>
                  <input id="d-custom" className="input" inputMode="numeric" placeholder="75" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ''))} />
                </span>
              </label>
            </div>

            <div className={s.step}>
              <h2 className={s.stepH}>How often?</h2>
              <Segmented
                id="freq"
                label="Frequency"
                value={freq}
                onChange={setFreq}
                options={[
                  { id: 'once', label: 'One time' },
                  { id: 'monthly', label: 'Monthly' },
                ]}
              />
            </div>
          </Reveal>

          <Reveal delay={0.08} className={s.summary}>
            <span className={s.sumKicker}>Your gift</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={`${value}-${freq}`} className={`${s.sumAmount} tabular`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                ${value.toLocaleString('en-US')}
                <span>{freq === 'monthly' ? ' / month' : ''}</span>
              </motion.p>
            </AnimatePresence>
            <p className={s.sumFund}>to {fund}</p>
            {checkoutUrl ? (
              <a href={checkoutUrl} target="_blank" rel="noreferrer" className={`btn btn-gold ${s.sumBtn}`} aria-disabled={value < 1}>
                <Icon name="heart" size={18} /> Continue to secure checkout
              </a>
            ) : (
              <>
                <button type="button" className={`btn btn-gold ${s.sumBtn}`} disabled>
                  <Icon name="heart" size={18} /> Online checkout opening soon
                </button>
                <p className={s.sumNote}>Until then, give in person at the masjid or contact us and we'll help you give.</p>
              </>
            )}
            <ul className={s.trust}>
              <li>
                <Icon name="shield" size={18} /> WMCC is a registered 501(c)(3) nonprofit
              </li>
              <li>
                <Icon name="check" size={18} /> Tax deductible · EIN {site.ein}
              </li>
            </ul>
          </Reveal>
        </div>

        <div className={s.other}>
          <Reveal className={s.otherCard}>
            <h3>Give in person</h3>
            <p>You can always give at the masjid when you come for prayer or Jumu'ah.</p>
          </Reveal>
          <Reveal delay={0.06} className={s.otherCard}>
            <h3>Questions about zakat?</h3>
            <p>We can help you work out what you owe and where it goes.</p>
            <Link to="/contact" className="text-link">
              Ask us <Icon name="arrow" size={16} />
            </Link>
          </Reveal>
          <Reveal delay={0.12} className={s.otherCard}>
            <h3>Give your time</h3>
            <p>Volunteers run our dinners, classes and youth nights. Every hand helps.</p>
            <Link to="/contact" className="text-link">
              Volunteer <Icon name="arrow" size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
