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

  return (
    <h1
      className={styles.manifesto}
      data-testid="manifesto-lens"
      {...(enabled ? { 'data-cursor-expand': '' } : {})}
    >
      <span className={styles.manifestoLayer}>
        {lines.map((line, index) => (
          <span
            key={`p-${line.en}-${index}`}
            className={accentLineIndexes.includes(index) ? styles.accentLine : styles.line}
          >
            {t(line)}
          </span>
        ))}
      </span>
      {enabled && (
        <span className={styles.manifestoReveal} aria-hidden>
          {altLines.map((line, index) => (
            <span
              key={`a-${line.en}-${index}`}
              className={
                altAccentLineIndexes.includes(index) ? styles.revealAccent : styles.revealLine
              }
            >
              {t(line)}
            </span>
          ))}
        </span>
      )}
    </h1>
  )
}
