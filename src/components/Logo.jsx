export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M6 36 V22 Q6 10 20 6 Q34 10 34 22 V36 Z" fill="none" stroke="#F6C88E" strokeWidth="2" />
      <path d="M20 6 V1" stroke="#F6C88E" strokeWidth="2" />
      <path d="M14 36 V26 Q14 21 20 20 Q26 21 26 26 V36" fill="none" stroke="#F6C88E" strokeWidth="2" />
    </svg>
  )
}
