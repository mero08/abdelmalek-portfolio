import { useRef } from 'react'
import { DualText } from '../../components/DualText/DualText'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import { AboutStatCard } from './AboutStatCard'
import styles from './About.module.css'
import { useAboutChoreography } from './useAboutChoreography'

export function About() {
  const { t } = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useAboutChoreography({
    sectionRef,
    pinRef,
    stats: site.aboutStats,
  })

  return (
    <section id="about" ref={sectionRef} className={styles.section}>
      <div ref={pinRef} className={styles.pin}>
        <div className={styles.grid}>
          <div className={styles.copy} data-about-copy="">
            <p className={styles.kicker} data-reveal>
              {t({ en: 'About me', ar: 'نبذة عني' })}
            </p>
            <DualText
              className={styles.body}
              primary={t(site.about)}
              alt={t(site.aboutAlt)}
            />
            <p className={styles.footnote} data-reveal>
              {t({
                en: 'Scroll — the numbers catch up.',
                ar: 'مرّر — الأرقام تلحق بك.',
              })}
            </p>
          </div>

          <div className={styles.stats} aria-label={t({ en: 'At a glance', ar: 'في لمحة' })}>
            {site.aboutStats.map((stat, index) => (
              <AboutStatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
