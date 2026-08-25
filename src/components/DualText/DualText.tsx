import { useState } from 'react'
import { useCursorLens } from '../CursorLens/CursorLensContext'
import styles from './DualText.module.css'

type Props = {
  primary: string
  alt: string
  className?: string
}

export function DualText({ primary, alt, className }: Props) {
  const { enabled } = useCursorLens()

  if (!enabled) {
    return (
      <FallbackDualText primary={primary} alt={alt} className={className} />
    )
  }

  return (
    <div
      data-testid="dual-text"
      data-cursor-expand=""
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <span className={styles.primary}>{primary}</span>
      <span className={styles.reveal} aria-hidden>
        <span className={styles.alt}>{alt}</span>
      </span>
    </div>
  )
}

function FallbackDualText({ primary, alt, className }: Props) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div
      data-testid="dual-text"
      data-revealed={revealed ? 'true' : 'false'}
      className={[styles.root, styles.fallback, className].filter(Boolean).join(' ')}
      tabIndex={0}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
    >
      <span className={styles.primary}>{primary}</span>
      <span className={styles.altFallback} aria-hidden={!revealed}>
        {alt}
      </span>
    </div>
  )
}
