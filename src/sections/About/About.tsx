import { DualText } from '../../components/DualText/DualText'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './About.module.css'

export function About() {
  const { t } = useLocale()

  return (
    <section id="about" className={styles.section}>
      <p className={styles.kicker} data-reveal>
        {t({ en: 'About me', ar: 'نبذة عني' })}
      </p>
      <DualText
        className={styles.body}
        primary={t(site.about)}
        alt={t(site.aboutAlt)}
      />
    </section>
  )
}
