import { motion } from 'framer-motion'

// Gentle rise-in as a section scrolls into view. Content starts visible (never fully hidden).
export default function Reveal({ children, delay = 0, as = 'div', className, style, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0.35, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
