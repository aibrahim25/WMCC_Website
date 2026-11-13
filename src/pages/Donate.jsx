import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Icon from '../components/Icon'
import donate from '../content/donate.json'
import { safeExternalUrl } from '../lib/events'
import { site } from '../lib/site'
import s from './Donate.module.css'

/** The masjid's online giving page (Masjidal), from site.json → integrations.donateUrl. */
const donateUrl = safeExternalUrl(site.integrations.donateUrl)

const STEPS = [
  { title: 'Tap Donate now', body: 'You go to the masjid’s secure giving page on Masjidal.' },
  { title: 'Choose your gift', body: 'Pick the fund and amount, one time or monthly.' },
  { title: 'Get your receipt', body: 'A receipt is emailed to you for your tax records.' },
]

export default function Donate() {
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
              <h2 className={s.stepH}>Where your gift goes</h2>
              <p className={s.stepLead}>
                WMCC runs entirely on community support. You can choose any of these funds when you give.
              </p>
            </div>
            <ul className={s.funds}>
              {donate.funds.map((f) => (
                <li key={f.id} className={s.fund}>
                  <span className={s.fundIcon}>
                    <Icon name={f.icon} size={20} />
                  </span>
                  <strong>{f.id}</strong>
                  <span className={s.fundBody}>{f.body}</span>
                </li>
              ))}
            </ul>

            <div className={s.step}>
              <h2 className={s.stepH}>How it works</h2>
              <ol className={s.steps}>
                {STEPS.map((step, i) => (
                  <li key={step.title}>
                    <span className={s.stepNum}>{i + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={0.08} className={s.summary}>
            <span className={s.sumKicker}>Give online</span>
            <h2 className={s.sumTitle}>Donate to WMCC</h2>
            <p className={s.sumText}>
              Secure online giving through Masjidal. Give once or set up a monthly donation to any fund.
            </p>
            {donateUrl ? (
              <a href={donateUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-gold ${s.sumBtn}`}>
                <Icon name="heart" size={18} /> Donate now
              </a>
            ) : (
              <>
                <button type="button" className={`btn btn-gold ${s.sumBtn}`} disabled>
                  <Icon name="heart" size={18} /> Online giving opening soon
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
