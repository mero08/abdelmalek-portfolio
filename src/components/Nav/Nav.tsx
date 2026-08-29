import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site } from '../../content/site'
import type { SocialId } from '../../content/types'
import { useLocale } from '../../i18n/useLocale'
import { CURSOR_MAGNET_ATTR } from '../CursorLens/cursorConfig'
import styles from './Nav.module.css'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './SocialIcons'
import { useMagneticSocials } from './useMagneticSocials'

const sections = [
  { id: 'about', en: 'About', ar: 'نبذة' },
  { id: 'featured', en: 'Work', ar: 'أعمال' },
  { id: 'contact', en: 'Contact', ar: 'تواصل' },
]

const socialIcons: Record<SocialId, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsAppIcon,
}

export function Nav() {
  const { lang, setLang, t } = useLocale()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const socialsRef = useRef<HTMLUListElement>(null)
  useMagneticSocials(socialsRef)

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
      <ul
        ref={socialsRef}
        className={styles.socials}
        aria-label="Social"
        data-testid="corner-socials"
      >
        {site.socials.map((social) => {
          const Icon = socialIcons[social.id]
          return (
            <li key={social.id}>
              <a
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className={styles.socialLink}
                {...{ [CURSOR_MAGNET_ATTR]: '' }}
              >
                <span className={styles.socialDisc} aria-hidden />
                <Icon className={styles.socialIcon} />
              </a>
            </li>
          )
        })}
      </ul>
    </header>
  )
}
