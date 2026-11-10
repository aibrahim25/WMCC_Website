import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import s from './Sky.module.css'

function Stars({ density = 70 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    let raf = 0
    let stars = []
    let shoot = null
    let nextShoot = performance.now() + 4000

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(24, Math.round(density * (w / 1200)))
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.55,
        r: Math.random() * 1.2 + 0.35,
        p: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random() * 1.5,
      }))
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      for (const st of stars) {
        const fade = Math.max(0, 1 - st.y / (h * 0.6))
        ctx.globalAlpha = (0.5 + 0.5 * Math.sin(st.p + t * 0.0012 * st.sp)) * fade
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduce) {
        if (!shoot && t > nextShoot) {
          shoot = { x: w * (0.2 + Math.random() * 0.6), y: h * (0.05 + Math.random() * 0.2), t0: t }
        }
        if (shoot) {
          const k = (t - shoot.t0) / 900
          if (k >= 1) {
            shoot = null
            nextShoot = t + 6000 + Math.random() * 7000
          } else {
            const x = shoot.x + k * 220
            const y = shoot.y + k * 90
            const g = ctx.createLinearGradient(x - 90, y - 37, x, y)
            g.addColorStop(0, 'rgba(255,255,255,0)')
            g.addColorStop(1, 'rgba(255,255,255,0.9)')
            ctx.globalAlpha = 1 - k
            ctx.strokeStyle = g
            ctx.lineWidth = 1.4
            ctx.beginPath()
            ctx.moveTo(x - 90, y - 37)
            ctx.lineTo(x, y)
            ctx.stroke()
          }
        }
        raf = requestAnimationFrame(draw)
      }
      ctx.globalAlpha = 1
    }

    resize()
    draw(performance.now())
    const ro = new ResizeObserver(() => {
      resize()
      if (reduce) draw(0)
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [density, reduce])

  return <canvas ref={ref} className={s.stars} aria-hidden="true" />
}

function MosqueSkyline({ y, y2 }) {
  return (
    <>
      <motion.svg className={s.skyline} style={{ y: y2 }} viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d="M0 220 L0 150 Q180 120 360 138 Q560 158 760 130 Q1000 100 1220 128 Q1340 140 1440 126 L1440 220 Z" fill="#18245A" opacity="0.55" />
      </motion.svg>
      <motion.svg className={s.skyline} style={{ y }} viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <g fill="#0B1130">
          <path d="M0 220 L0 176 Q260 158 520 170 Q720 180 900 166 Q1160 148 1440 168 L1440 220 Z" />
          <rect x="612" y="132" width="216" height="88" />
          <path d="M650 134 Q650 80 720 66 Q790 80 790 134 Z" />
          <rect x="718" y="44" width="4" height="24" />
          <path d="M714 44 Q720 30 726 44 Z" />
          <path d="M600 140 Q600 118 626 112 Q652 118 652 140 Z" />
          <path d="M788 140 Q788 118 814 112 Q840 118 840 140 Z" />
          <rect x="566" y="78" width="16" height="142" />
          <path d="M562 80 L574 50 L586 80 Z" />
          <rect x="858" y="78" width="16" height="142" />
          <path d="M854 80 L866 50 L878 80 Z" />
          <path d="M120 176 q14 -30 28 0 z M180 172 q10 -22 20 0 z M1250 168 q14 -30 28 0 z M1310 170 q10 -22 20 0 z" />
        </g>
        <g fill="#F6C88E" opacity="0.85">
          <rect x="676" y="150" width="10" height="16" rx="5" />
          <rect x="715" y="146" width="10" height="20" rx="5" />
          <rect x="754" y="150" width="10" height="16" rx="5" />
        </g>
      </motion.svg>
    </>
  )
}

function Hills({ y, ground }) {
  return (
    <motion.svg className={s.skyline} style={{ y }} viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 110 L0 60 Q240 26 480 50 Q720 74 960 44 Q1200 16 1440 46 L1440 110 Z" fill={ground} opacity="0.45" />
      <path d="M0 110 L0 78 Q300 54 620 74 Q900 92 1180 66 Q1320 56 1440 70 L1440 110 Z" fill={ground} />
    </motion.svg>
  )
}

// The sunset sky used at the top of every page.
// variant "home" draws the masjid skyline; "page" draws soft hills that blend into `ground`.
export default function Sky({ variant = 'page', ground = 'var(--paper)', children, className = '' }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 36])
  const y2 = useTransform(scrollY, [0, 600], [0, 70])
  const moonY = useTransform(scrollY, [0, 600], [0, 90])

  return (
    <section className={`${s.sky} ${variant === 'home' ? s.home : s.page} ${className}`}>
      <div className={s.glow} aria-hidden="true" />
      <Stars density={variant === 'home' ? 90 : 60} />
      <motion.svg className={s.moon} style={{ y: moonY }} width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M40 8 A26 26 0 1 0 56 50 A20 20 0 1 1 40 8 Z" fill="#F8E3B8" />
      </motion.svg>
      <div className={s.content}>{children}</div>
      {variant === 'home' ? <MosqueSkyline y={y} y2={y2} /> : <Hills ground={ground} />}
    </section>
  )
}
