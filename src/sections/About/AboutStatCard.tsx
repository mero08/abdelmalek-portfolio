import type { AboutStat } from '../../content/types'
import { useLocale } from '../../i18n/useLocale'
import { formatStatValue } from './formatStatValue'
import styles from './About.module.css'

type Props = {
  stat: AboutStat
  index: number
  displayValue?: string
}

export function AboutStatCard({ stat, index, displayValue }: Props) {
  const { t } = useLocale()
  const valueText =
    displayValue ?? formatStatValue(0, stat.format, stat.suffix ?? '')

  return (
    <article className={styles.card} data-about-stat="">
      <span className={styles.cardIndex} aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>
      <p
        className={styles.cardValue}
        data-stat-value=""
        aria-label={`${valueText} ${t(stat.label)}`}
      >
        {valueText}
      </p>
      <p className={styles.cardLabel}>{t(stat.label)}</p>
      {stat.detail && <p className={styles.cardDetail}>{t(stat.detail)}</p>}
      <span className={styles.cardRule} aria-hidden />
    </article>
  )
}
