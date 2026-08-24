import styles from './CoverImage.module.css'

type Props = {
  cover: string | null
  title: string
  className?: string
}

export function CoverImage({ cover, title, className }: Props) {
  if (cover) {
    return (
      <img
        className={[styles.img, className].filter(Boolean).join(' ')}
        src={cover}
        alt={title}
        loading="lazy"
      />
    )
  }
  return (
    <div className={[styles.placeholder, className].filter(Boolean).join(' ')} aria-hidden>
      <span>{title}</span>
    </div>
  )
}
