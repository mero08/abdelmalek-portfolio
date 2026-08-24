import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Contact.module.css'

export function Contact() {
  const { t } = useLocale()

  return (
    <section id="contact" className={styles.section}>
      <h2 className={styles.heading}>{t({ en: 'Contact', ar: 'تواصل' })}</h2>
      <a href={`mailto:${site.email}`} className={styles.email}>
        {site.email}
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
      <p className={styles.closing}>
        {t({
          en: 'Available for selective projects.',
          ar: 'متاح لعمل انتقائي.',
        })}
      </p>
    </section>
  )
}
