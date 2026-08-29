import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Contact.module.css'

export function Contact() {
  const { t } = useLocale()
  const emailAlt = t({
    en: '100% chance I read it.',
    ar: 'أقرأ الرسائل دائماً.',
  })

  return (
    <section id="contact" className={styles.section}>
      <p className={styles.kicker} data-reveal>
        {t({ en: 'Connect', ar: 'تواصل' })}
      </p>

      <a
        href={`mailto:${site.email}`}
        className={styles.emailWipe}
        aria-label={`${site.email}. Alternate: ${emailAlt}`}
      >
        <span className={styles.emailWipeStack}>
          <span className={styles.emailWipePrimary}>{site.email}</span>
          <span className={styles.emailWipeAlt} aria-hidden>
            {emailAlt}
          </span>
        </span>
      </a>

      <a className={styles.phone} href={`tel:${site.phoneE164}`}>
        {site.phone}
      </a>

      <ul className={styles.socials}>
        {site.socials.map((social) => (
          <li key={social.label}>
            <a href={social.url} target="_blank" rel="noreferrer">
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
