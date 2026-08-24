import { reels } from '../../content/reels'
import { useLocale } from '../../i18n/useLocale'
import { VideoPlayer } from '../../components/VideoPlayer/VideoPlayer'
import styles from './Reels.module.css'

export function Reels() {
  const { t } = useLocale()

  if (reels.length === 0) return null

  return (
    <section id="reels" className={styles.section}>
      <h2 className={styles.heading} data-reveal>
        {t({ en: 'Reels', ar: 'ريلز' })}
      </h2>
      <ul className={styles.strip}>
        {reels.map((reel) => (
          <li key={reel.id} className={styles.card}>
            <VideoPlayer
              provider={reel.provider}
              url={reel.url}
              cover={reel.cover}
              title={t(reel.title)}
            />
            <p className={styles.title}>{t(reel.title)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
