import { Link, useParams } from 'react-router-dom'
import { CoverImage } from '../components/CoverImage/CoverImage'
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer'
import { getAdjacentFilms, getFilmBySlug } from '../content/films'
import { useLocale } from '../i18n/useLocale'
import styles from './Work.module.css'

export function Work() {
  const { slug = '' } = useParams()
  const { t } = useLocale()
  const film = getFilmBySlug(slug)

  if (!film) {
    return (
      <main className={styles.notFound}>
        <p>Not found</p>
        <Link to="/">Home</Link>
      </main>
    )
  }

  const { prev, next } = getAdjacentFilms(slug)
  const title = t(film.title)

  return (
    <main className={styles.page}>
      <div className={styles.cover}>
        <CoverImage cover={film.cover} title={title} />
      </div>

      <div className={styles.content}>
        <Link to="/#featured" className={styles.back}>
          {t({ en: 'Back to work', ar: 'العودة للأعمال' })}
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.hook}>{t(film.hook)}</p>
        </header>

        <div className={styles.player}>
          <VideoPlayer
            provider={film.provider}
            url={film.url}
            cover={film.cover}
            title={title}
          />
        </div>

        <div className={styles.story}>
          <p>{t(film.story)}</p>
          {film.role ? <p className={styles.role}>{t(film.role)}</p> : null}
        </div>

        {film.stills.length > 0 ? (
          <div className={styles.stills}>
            {film.stills.map((still) => (
              <img key={still} className={styles.still} src={still} alt="" loading="lazy" />
            ))}
          </div>
        ) : null}

        {prev || next ? (
          <nav className={styles.adjacent} aria-label={t({ en: 'More films', ar: 'المزيد من الأفلام' })}>
            {prev ? <Link to={`/work/${prev.slug}`}>{t(prev.title)}</Link> : <span />}
            {next ? (
              <Link to={`/work/${next.slug}`} className={styles.next}>
                {t(next.title)}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  )
}
