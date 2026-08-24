import { Link } from 'react-router-dom'
import { films } from '../../content/films'
import { useLocale } from '../../i18n/useLocale'
import { CoverTransition } from '../../components/webgl/CoverTransition'
import styles from './Featured.module.css'

export function Featured() {
  const { t } = useLocale()
  const list = [...films].sort((a, b) => a.sortOrder - b.sortOrder)
  if (list.length === 0) return null

  return (
    <section id="featured" className={styles.section}>
      <h2 className={styles.heading} data-reveal>
        {t({ en: 'Selected films', ar: 'أفلام مختارة' })}
      </h2>
      <ul className={styles.list}>
        {list.map((film) => (
          <li key={film.slug}>
            <Link to={`/work/${film.slug}`} className={styles.card} aria-label={t(film.title)}>
              <div className={styles.media}>
                <CoverTransition cover={film.cover} title={t(film.title)} />
              </div>
              <div className={styles.meta}>
                <h3>{t(film.title)}</h3>
                <p>{t(film.hook)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
