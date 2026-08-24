import { Link, useLocation } from 'react-router-dom'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Nav.module.css'

const sections = [
  { id: 'about', en: 'About', ar: 'نبذة' },
  { id: 'featured', en: 'Work', ar: 'أعمال' },
  { id: 'contact', en: 'Contact', ar: 'تواصل' },
]

export function Nav() {
  const { lang, setLang, t } = useLocale()
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  return (
    <header className={styles.nav}>
      <Link to="/" className={styles.brand} aria-label={site.name}>
        A
      </Link>
      <div className={styles.topRight}>
        <nav className={styles.links} aria-label="Primary">
          {onHome &&
            sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {t({ en: s.en, ar: s.ar })}
              </a>
            ))}
          {!onHome && (
            <Link to="/#featured">{t({ en: 'Work', ar: 'أعمال' })}</Link>
          )}
        </nav>
        <div className={styles.lang} role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
            EN
          </button>
          <button type="button" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')}>
            ع
          </button>
        </div>
      </div>
      <ul className={styles.socials}>
        {site.socials.map((social) => (
          <li key={social.label}>
            <a href={social.url} target="_blank" rel="noreferrer">
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  )
}
