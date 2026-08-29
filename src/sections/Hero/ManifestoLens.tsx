import { useEffect, useRef, useState } from 'react'
import type { LocaleString } from '../../content/types'
import { useCursorEngine } from '../../components/CursorLens/CursorLensContext'
import { useLocale } from '../../i18n/useLocale'
import styles from './Hero.module.css'

type Props = {
  lines: LocaleString[]
  altLines: LocaleString[]
  accentLineIndexes: number[]
  altAccentLineIndexes: number[]
}

export function ManifestoLens({
  lines,
  altLines,
  accentLineIndexes,
  altAccentLineIndexes,
}: Props) {
  const { t } = useLocale()
  const { enabled } = useCursorEngine()
  const manifestoRef = useRef<HTMLHeadingElement>(null)
  const [revealReady, setRevealReady] = useState(false)

  useEffect(() => {
    if (!enabled || revealReady) return undefined

    const node = manifestoRef.current
    if (!node) return undefined

    const activate = () => setRevealReady(true)
    node.addEventListener('pointerenter', activate, { once: true, passive: true })
    return () => node.removeEventListener('pointerenter', activate)
  }, [enabled, revealReady])

  return (
    <h1
      ref={manifestoRef}
      className={styles.manifesto}
      data-testid="manifesto-lens"
      {...(enabled ? { 'data-cursor-expand': '' } : {})}
    >
      <span className={styles.manifestoLayer}>
        {lines.map((line, index) => (
          <span key={`p-${line.en}-${index}`} className={styles.lineClip}>
            <span
              data-hero-line
              className={accentLineIndexes.includes(index) ? styles.accentLine : styles.line}
            >
              {t(line)}
            </span>
          </span>
        ))}
      </span>
      {enabled && revealReady ? (
        <span className={styles.manifestoReveal} aria-hidden>
          {altLines.map((line, index) => (
            <span key={`a-${line.en}-${index}`} className={styles.lineClip}>
              <span
                className={
                  altAccentLineIndexes.includes(index) ? styles.revealAccent : styles.revealLine
                }
              >
                {t(line)}
              </span>
            </span>
          ))}
        </span>
      ) : null}
    </h1>
  )
}
