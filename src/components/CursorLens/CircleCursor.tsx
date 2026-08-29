import { useCursorEngine } from './CursorLensContext'
import styles from './CircleCursor.module.css'

export function CircleCursor() {
  const { enabled, trackRef, discRef } = useCursorEngine()
  if (!enabled) return null

  return (
    <div ref={trackRef} className={styles.track} aria-hidden>
      <div ref={discRef} className={styles.disc} data-mode="idle" />
    </div>
  )
}

export { EXPAND_SIZE, IDLE_SIZE, SOCIAL_SIZE } from './cursorConfig'
