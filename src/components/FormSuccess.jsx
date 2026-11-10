import { motion } from 'framer-motion'
import Icon from './Icon'

export default function FormSuccess({ title, body, actionLabel, onReset }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: '24px 0' }}
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
        style={{ width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg, #5B70B4, #E9A58E)' }}
      >
        <Icon name="check" size={28} stroke={2.5} />
      </motion.span>
      <h3 style={{ fontSize: 30 }}>{title}</h3>
      <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: '46ch' }}>{body}</p>
      <button type="button" className="btn btn-outline" onClick={onReset}>
        {actionLabel}
      </button>
    </motion.div>
  )
}
