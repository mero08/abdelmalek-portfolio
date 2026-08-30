import { lazy, Suspense, useRef } from 'react'
import { useWebglEnabled } from '../../components/webgl/useWebglEnabled'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import { HERO_CINEMA_SRC } from './heroMedia'
import styles from './Hero.module.css'
import { ManifestoLens } from './ManifestoLens'
import { useHeroChoreography } from './useHeroChoreography'

const HeroScene = lazy(() =>
  import('../../components/webgl/HeroScene').then((m) => ({
    default: m.HeroScene,
  })),
)

export function Hero() {
  const { t } = useLocale()
  const webglEnabled = useWebglEnabled()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  useHeroChoreography({
    sectionRef,
    pinRef,
    progressRef,
  })

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={styles.section}
      data-webgl={webglEnabled ? 'true' : 'false'}
      style={{ ['--hero-p' as string]: 0 }}
    >
      <div ref={pinRef} className={styles.pin}>
        <div
          data-hero-canvas
          className={`${styles.canvas}${webglEnabled ? '' : ` ${styles.canvasFallback}`}`}
        >
          {webglEnabled && (
            <Suspense fallback={null}>
              <HeroScene progressRef={progressRef} />
            </Suspense>
          )}
        </div>

        <div className={styles.cinema} aria-hidden>
          <img
            className={styles.cinemaImg}
            src={HERO_CINEMA_SRC}
            alt=""
            width={2400}
            height={1600}
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className={styles.grain} aria-hidden />
        <div className={styles.vignette} aria-hidden />
        <div className={styles.letterbox} aria-hidden>
          <span />
          <span />
        </div>
        <div className={styles.melt} aria-hidden />

        <div className={styles.content}>
          <p data-hero-label className={styles.label}>
            {t(site.hero.label)}
          </p>
          <ManifestoLens
            lines={site.hero.lines}
            altLines={site.hero.altLines}
            accentLineIndexes={site.hero.accentLineIndexes}
            altAccentLineIndexes={site.hero.altAccentLineIndexes}
          />
          <div className={styles.scrollFade}>
            <div data-hero-scroll className={styles.scroll}>
              <span className={styles.scrollLine} aria-hidden />
              <span>{t({ en: 'Scroll', ar: 'مرر' })}</span>
              <span className={styles.scrollPulse} aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
