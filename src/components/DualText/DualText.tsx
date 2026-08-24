import { useState } from 'react'
import styles from './DualText.module.css'

type Props = {
  primary: string
  alt: string
  className?: string
}

export function DualText({ primary, alt, className }: Props) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      data-testid="dual-text"
      data-revealed={revealed ? 'true' : 'false'}
      className={[styles.root, className].filter(Boolean).join(' ')}
      tabIndex={0}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
    >
      <span className={styles.primary}>{primary}</span>
      <span className={styles.alt} aria-hidden={!revealed}>
        {alt}
      </span>
    </div>
  )
}
