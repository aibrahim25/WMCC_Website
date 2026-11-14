import s from './FooterSky.module.css'

const STAR_COUNT = 70
const SHOOTING_STARS = 3

/** Small seeded random generator, so the star field looks the same on every visit. */
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const random = seeded(42)
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const bright = i % 9 === 0
  return {
    left: `${(random() * 100).toFixed(2)}%`,
    top: `${(random() * 100).toFixed(2)}%`,
    size: bright ? 2.5 : 1 + random() * 1.2,
    duration: `${(2.5 + random() * 4).toFixed(1)}s`,
    delay: `-${(random() * 6).toFixed(1)}s`,
    bright,
  }
})

/** Decorative night sky behind the footer: Milky Way band, twinkling and shooting stars, and a glowing moon. */
export default function FooterSky() {
  return (
    <div className={s.sky} aria-hidden="true">
      <div className={s.galaxy} />
      <div className={s.dust} />

      {STARS.map((star, i) => (
        <span
          key={i}
          className={`${s.star} ${star.bright ? s.bright : ''}`}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}

      {Array.from({ length: SHOOTING_STARS }, (_, i) => (
        <span key={i} className={`${s.shooting} ${s[`shooting${i + 1}`]}`} />
      ))}

      <div className={s.moon}>
        <span className={s.halo} />
        <svg width="46" height="46" viewBox="0 0 64 64">
          <path d="M40 8 A26 26 0 1 0 56 50 A20 20 0 1 1 40 8 Z" fill="#F8E3B8" />
        </svg>
      </div>
    </div>
  )
}