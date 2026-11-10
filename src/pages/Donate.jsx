import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Segmented from '../components/Segmented'
import Icon from '../components/Icon'
import donate from '../content/donate.json'
import { site } from '../lib/site'
import s from './Donate.module.css'

const { funds, amounts, defaultAmount } = donate

/**
 * Link to the external payment page with the visitor's choices appended as query parameters
 * (fund, amount, frequency). Empty when no `integrations.donateUrl` is configured.
 */
function buildCheckoutUrl({ fund, amount, frequency }) {
  const base = site.integrations.donateUrl
  if (!base) return ''
  try {
    const url = new URL(base)
    url.searchParams.set('fund', fund)
    url.searchParams.set('amount', String(amount))
    url.searchParams.set('frequency', frequency)
    return url.toString()
  } catch {
    console.error(`site.json integrations.donateUrl is not a valid URL: ${base}`)
    return ''
  }
}

export default function Donate() {
  // The home page can pre-select a fund: <Link to="/donate" state={{ fund: 'Zakat' }}>
  const { state } = useLocation()
  const [fund, setFund] = useState(funds.some((f) => f.id === state?.fund) ? state.fund : funds[0].id)
  const [amount, setAmount] = useState(defaultAmount)
  const [custom, setCustom] = useState('')
  const [freq, setFreq] = useState('once')

  const value = custom ? Number(custom) : amount
  const checkoutUrl = buildCheckoutUrl({ fund, amount: value, frequency: freq })

  return (
    <>
      <PageHero
        arabic="وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ"
        title="Support WMCC"
        lead="Whatever good you give benefits your own self. Every gift keeps our masjid open for prayer, learning and community."
      />

      <section className="container section-end">
        <div className={s.layout}>
          <Reveal className={s.builder}>
            <div className={s.step}>
              <h2 className={s.stepH}>Choose a fund</h2>
              <div className={s.funds} role="radiogroup" aria-label="Fund">
                {funds.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={fund === f.id}
                    className={`${s.fund} ${fund === f.id ? s.fundOn : ''}`}
                    onClick={() => setFund(f.id)}
                  >
                    <span className={s.fundTop}>
                      <strong>{f.id}</strong>
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
                {amounts.map((a) => {
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
                  <input
                    id="d-custom"
                    className="input"
                    inputMode="numeric"
                    placeholder="75"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ''))}
                  />
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
              <motion.p
                key={`${value}-${freq}`}
                className={`${s.sumAmount} tabular`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                ${value.toLocaleString('en-US')}
                <span>{freq === 'monthly' ? ' / month' : ''}</span>
              </motion.p>
            </AnimatePresence>
            <p className={s.sumFund}>to {fund}</p>
            {checkoutUrl && value >= 1 ? (
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-gold ${s.sumBtn}`}>
                <Icon name="heart" size={18} /> Continue to secure checkout
              </a>
            ) : checkoutUrl ? (
              <button type="button" className={`btn btn-gold ${s.sumBtn}`} disabled>
                <Icon name="heart" size={18} /> Enter an amount
              </button>
            ) : (
              <>
                <button type="button" className={`btn btn-gold ${s.sumBtn}`} disabled>
                  <Icon name="heart" size={18} /> Online checkout opening soon
                </button>
                <p className={s.sumNote}>
                  Until then, give in person at the masjid or contact us and we'll help you give.
                </p>
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
