import { useState } from 'react'
import { Link } from 'react-router-dom'
import { films } from '../../content/films'
import { useLocale } from '../../i18n/useLocale'
import styles from './Featured.module.css'

export function Featured() {
  const { t } = useLocale()
  const list = [...films].sort((a, b) => a.sortOrder - b.sortOrder)
  const [active, setActive] = useState(0)

  if (list.length === 0) return null

  return (
    <section id="featured" className={styles.section}>
      <p className={styles.kicker} data-reveal>
        {t({ en: 'Selected films', ar: 'أفلام مختارة' })}
      </p>
      <ul className={styles.list}>
        {list.map((film, index) => {
          const isActive = index === active
          return (
            <li key={film.slug}>
              <Link
                to={`/work/${film.slug}`}
                className={styles.row}
                data-active={isActive ? 'true' : 'false'}
                aria-label={t(film.title)}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <span className={styles.bar} aria-hidden={!isActive} />
                <span className={styles.title}>{t(film.title)}</span>
                <span className={styles.hook}>{t(film.hook)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
