import { motion } from 'framer-motion'
import Sky from './Sky'
import s from './PageHero.module.css'

/** Sunset-sky header used at the top of every inner page. `ground` should match the colour of the section below. */
export default function PageHero({ arabic, title, lead, children, ground }) {
  return (
    <Sky variant="page" ground={ground}>
      <div className={`container ${s.wrap}`}>
        {arabic && (
          <motion.p
            className={s.arabic}
            lang="ar"
            dir="rtl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {arabic}
          </motion.p>
        )}
        <motion.h1
          className={s.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          {title}
        </motion.h1>
        {lead && (
          <motion.p
            className={s.lead}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            {lead}
          </motion.p>
        )}
        {children && (
          <motion.div
            className={s.extra}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </Sky>
  )
}
