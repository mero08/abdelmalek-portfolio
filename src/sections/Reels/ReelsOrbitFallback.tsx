import { useState } from 'react'
import type { Reel } from '../../content/types'
import { useLocale } from '../../i18n/useLocale'
import { ReelsFocusPlayer } from './ReelsFocusPlayer'
import styles from './Reels.module.css'

type ReelsOrbitFallbackProps = {
  reels: Reel[]
}

export function ReelsOrbitFallback({ reels }: ReelsOrbitFallbackProps) {
  const { t } = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const active = reels[activeIndex]

  return (
    <div className={styles.fallback}>
      <div className={styles.fallbackPlayer} data-testid="reels-fallback-player">
        <ReelsFocusPlayer
          playbackId={active.muxPlaybackId}
          title={t(active.title)}
          poster={active.cover}
          playing
        />
      </div>
      <ul className={styles.fallbackList}>
        {reels.map((reel, index) => (
          <li key={reel.id}>
            <button
              type="button"
              className={`${styles.fallbackButton} ${
                index === activeIndex ? styles.fallbackButtonActive : ''
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={reel.cover} alt="" loading="lazy" />
              <span>{t(reel.title)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
