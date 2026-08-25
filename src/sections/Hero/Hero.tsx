import { HeroScene } from '../../components/webgl/HeroScene'
import { useWebglEnabled } from '../../components/webgl/useWebglEnabled'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Hero.module.css'
import { ManifestoLens } from './ManifestoLens'

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
        <ManifestoLens
          lines={site.hero.lines}
          altLines={site.hero.altLines}
          accentLineIndexes={site.hero.accentLineIndexes}
          altAccentLineIndexes={site.hero.altAccentLineIndexes}
        />
        <div className={styles.scroll}>
          <span className={styles.scrollLine} aria-hidden />
          <span>{t({ en: 'Scroll', ar: 'مرر' })}</span>
        </div>
      </div>
    </section>
  )
}
