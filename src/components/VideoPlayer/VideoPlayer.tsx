import { useMemo, useState } from 'react'
import { toEmbedSrc, toWatchUrl } from '../../lib/embeds'
import type { EmbedProvider } from '../../content/types'
import { CoverImage } from '../CoverImage/CoverImage'
import styles from './VideoPlayer.module.css'

type Props = {
  provider: EmbedProvider
  url: string
  cover: string | null
  title: string
}

export function VideoPlayer({ provider, url, cover, title }: Props) {
  const [active, setActive] = useState(false)
  const embed = useMemo(() => toEmbedSrc(provider, url), [provider, url])
  const watch = useMemo(() => toWatchUrl(provider, url), [provider, url])

  if (active && !embed) {
    return (
      <div className={styles.frame}>
        <CoverImage cover={cover} title={title} />
        <div className={styles.overlay}>
          <p>Video unavailable</p>
          <a href={watch} target="_blank" rel="noreferrer">
            Open video
          </a>
        </div>
      </div>
    )
  }

  if (active && embed) {
    return (
      <div className={styles.frame}>
        <iframe
          className={styles.iframe}
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={styles.frame}
      onClick={() => setActive(true)}
      aria-label={`Play ${title}`}
    >
      <CoverImage cover={cover} title={title} />
      <span className={styles.play}>Play</span>
    </button>
  )
}
