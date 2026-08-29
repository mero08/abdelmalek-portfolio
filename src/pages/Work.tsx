import { Link, useParams } from 'react-router-dom'
import { FilmCover } from '../components/CoverImage/FilmCover'
import coverStyles from '../components/CoverImage/CoverImage.module.css'
import playerStyles from '../components/VideoPlayer/VideoPlayer.module.css'
import { getAdjacentFilms, getFilmBySlug } from '../content/films'
import { useLocale } from '../i18n/useLocale'
import { toWatchUrl } from '../lib/embeds'
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
  const watchUrl = toWatchUrl(film.provider, film.url)

  return (
    <main className={styles.page}>
      <div className={styles.cover}>
        <FilmCover film={film} title={title} className={coverStyles.img} loading="eager" />
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
          <div className={styles.playerShell}>
            <Link
              to={`/work/${slug}/watch`}
              className={playerStyles.frame}
              aria-label={t({ en: `Play ${title}`, ar: `تشغيل ${title}` })}
            >
              <FilmCover film={film} title={title} className={coverStyles.img} />
              <span className={playerStyles.play}>{t({ en: 'Play', ar: 'تشغيل' })}</span>
            </Link>
            <a
              className={styles.playerWatchLink}
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t({ en: 'Open on YouTube', ar: 'فتح على يوتيوب' })}
            </a>
          </div>
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
