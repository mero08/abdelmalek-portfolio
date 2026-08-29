import { reels } from '../../content/reels'
import { useLocale } from '../../i18n/useLocale'
import { ReelsOrbitDial } from './ReelsOrbitDial'
import styles from './Reels.module.css'

export function Reels() {
  const { t } = useLocale()

  if (reels.length === 0) return null

  return (
    <section id="reels" className={styles.section}>
      <h2 className={styles.heading} data-reveal>
        {t({ en: 'Reels', ar: 'ريلز' })}
      </h2>
      <ReelsOrbitDial reels={reels} />
    </section>
  )
}
