import { motion } from 'framer-motion'
import Icon from './Icon'
import s from './FormSuccess.module.css'

/** Confirmation shown in place of a form after it is sent. */
export default function FormSuccess({ title, body, actionLabel, onReset }) {
  return (
    <motion.div
      role="status"
      className={s.wrap}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.span
        className={s.icon}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
      >
        <Icon name="check" size={28} stroke={2.5} />
      </motion.span>
      <h3 className={s.title}>{title}</h3>
      <p className={s.body}>{body}</p>
      <button type="button" className="btn btn-outline" onClick={onReset}>
        {actionLabel}
      </button>
    </motion.div>
  )
}
