import { HeroScene } from '../../components/webgl/HeroScene'
import { useWebglEnabled } from '../../components/webgl/useWebglEnabled'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Hero.module.css'

export function Hero() {
  const { t } = useLocale()
  const webglEnabled = useWebglEnabled()

  return (
    <section id="hero" className={styles.section}>
      <div
        data-hero-canvas
        className={`${styles.canvas}${webglEnabled ? '' : ` ${styles.canvasFallback}`}`}
      >
        {webglEnabled && <HeroScene />}
      </div>
      <div className={styles.content}>
        <p className={styles.label}>{t(site.hero.label)}</p>
        <h1 className={styles.manifesto}>
          {site.hero.lines.map((line, index) => {
            const accent = site.hero.accentLineIndexes.includes(index)
            return (
              <span
                key={`${line.en}-${index}`}
                className={accent ? styles.accentLine : styles.line}
              >
                {t(line)}
              </span>
            )
          })}
        </h1>
        <div className={styles.scroll}>
          <span className={styles.scrollLine} aria-hidden />
          <span>{t({ en: 'Scroll', ar: 'مرر' })}</span>
        </div>
      </div>
    </section>
  )
}
