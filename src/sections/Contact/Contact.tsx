import { DualText } from '../../components/DualText/DualText'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Contact.module.css'

export function Contact() {
  const { t } = useLocale()

  return (
    <section id="contact" className={styles.section}>
      <p className={styles.kicker} data-reveal>
        {t({ en: 'Connect', ar: 'تواصل' })}
      </p>
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
      <DualText
        className={styles.closing}
        primary={t({
          en: 'Available for selective projects.',
          ar: 'متاح لعمل انتقائي.',
        })}
        alt={t({
          en: '100% chance I read the email.',
          ar: 'أقرأ الرسائل دائماً.',
        })}
      />
    </section>
  )
}
