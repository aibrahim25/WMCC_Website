import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

export default function NotFound() {
  return (
    <>
      <PageHero title="We couldn't find that page" lead="The link may be old or mistyped. Try one of these instead.">
        <Link to="/" className="btn btn-light">
          Go home
        </Link>
        <Link to="/prayer-times" className="btn btn-ghost-light">
          Prayer times
        </Link>
      </PageHero>
      <div className="section-end" />
    </>
  )
}
