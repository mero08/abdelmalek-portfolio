import { useEffect, useState } from 'react'
import type { Film } from '../../content/types'
import { extractYoutubeId, resolveFilmCover, youtubeThumbnail } from '../../lib/embeds'
import { CoverImage } from './CoverImage'
import styles from './CoverImage.module.css'

type Props = {
  film: Pick<Film, 'cover' | 'provider' | 'url'>
  title: string
  className?: string
  loading?: 'lazy' | 'eager'
}

function filmSourceKey(film: Pick<Film, 'cover' | 'provider' | 'url'>) {
  return `${film.provider}:${film.url}:${film.cover ?? ''}`
}

export function FilmCover({ film, title, className, loading = 'lazy' }: Props) {
  const sourceKey = filmSourceKey(film)
  const [src, setSrc] = useState(() => resolveFilmCover(film))
  const [ready, setReady] = useState(false)
  const youtubeId = film.provider === 'youtube' ? extractYoutubeId(film.url) : null

  useEffect(() => {
    setSrc(resolveFilmCover(film))
    setReady(false)
  }, [sourceKey])

  if (!src) {
    return <CoverImage cover={null} title={title} className={className} />
  }

  return (
    <span className={styles.shell}>
      {!ready ? <span className={styles.loading} aria-hidden /> : null}
      <img
        key={sourceKey}
        className={[styles.img, className].filter(Boolean).join(' ')}
        src={src}
        alt={title}
        loading={loading}
        onLoad={() => setReady(true)}
        onError={() => {
          if (youtubeId && src.includes('maxresdefault')) {
            setSrc(youtubeThumbnail(youtubeId, 'hqdefault'))
            setReady(false)
          }
        }}
      />
    </span>
  )
}
