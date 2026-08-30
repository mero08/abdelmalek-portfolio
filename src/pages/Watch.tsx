import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdjacentFilms, getFilmBySlug } from '../content/films'
import { useLocale } from '../i18n/useLocale'
import { resolveFilmCover, toEmbedSrc, toWatchUrl } from '../lib/embeds'
import workStyles from './Work.module.css'
import styles from './Watch.module.css'

export function Watch() {
  const { slug = '' } = useParams()
  const { t } = useLocale()
  const film = getFilmBySlug(slug)
  const title = film ? t(film.title) : ''
  const { prev, next } = getAdjacentFilms(slug)
  const [embedReady, setEmbedReady] = useState(false)
  const [embedEpoch, setEmbedEpoch] = useState(0)
  const embedSrc = useMemo(
    () => (film ? toEmbedSrc(film.provider, film.url, { autoplay: true }) : null),
    [film],
  )

  useEffect(() => {
    setEmbedReady(false)
    setEmbedEpoch(0)
  }, [slug])

  // Warm adjacent film posters so next/prev watch feels instant
  useEffect(() => {
    for (const neighbor of [prev, next]) {
      if (!neighbor) continue
      const cover = resolveFilmCover(neighbor)
      if (!cover) continue
      const img = new Image()
      img.decoding = 'async'
      img.src = cover
    }
  }, [next, prev])

  if (!film || !embedSrc) {
    return (
      <main className={styles.notFound}>
        <p>{t({ en: 'Not found', ar: 'غير موجود' })}</p>
        <Link to="/#featured">{t({ en: 'Back to work', ar: 'العودة للأعمال' })}</Link>
      </main>
    )
  }

  const watchUrl = toWatchUrl(film.provider, film.url)

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Link to={`/work/${slug}`} className={styles.back}>
          {t({ en: 'Back to film', ar: 'العودة للفيلم' })}
        </Link>
        <p className={styles.title}>{title}</p>
      </div>

      <div className={styles.stage}>
        <div className={styles.frame} aria-busy={!embedReady}>
          {!embedReady ? <div className={styles.embedLoading} aria-hidden /> : null}
          <iframe
            key={`${slug}-${embedEpoch}`}
            className={styles.iframe}
            src={embedSrc}
            title={title}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setEmbedReady(true)}
            onError={() => {
              if (embedEpoch < 1) {
                setEmbedReady(false)
                setEmbedEpoch(1)
              }
            }}
          />
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.foot}>
          <a href={watchUrl} target="_blank" rel="noreferrer">
            {t({ en: 'Open on YouTube', ar: 'فتح على يوتيوب' })}
          </a>
        </div>

        {prev || next ? (
          <nav className={workStyles.adjacent} aria-label={t({ en: 'More films', ar: 'المزيد من الأفلام' })}>
            {prev ? (
              <Link to={`/work/${prev.slug}/watch`}>{t(prev.title)}</Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/work/${next.slug}/watch`} className={workStyles.next}>
                {t(next.title)}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  )
}
