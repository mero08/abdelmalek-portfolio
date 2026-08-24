import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './About.module.css'

export function About() {
  const { t } = useLocale()

  return (
    <section id="about" className={styles.section}>
      <h2 className={styles.heading} data-reveal>
        {t({ en: 'About', ar: 'نبذة' })}
      </h2>
      <p className={styles.body}>{t(site.about)}</p>
    </section>
  )
}
