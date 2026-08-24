import { Link, useParams } from 'react-router-dom'
import { getFilmBySlug } from '../content/films'
import { useLocale } from '../i18n/useLocale'

export function Work() {
  const { slug = '' } = useParams()
  const { t } = useLocale()
  const film = getFilmBySlug(slug)

  if (!film) {
    return (
      <main style={{ padding: '4rem 1.5rem' }}>
        <p>Not found</p>
        <Link to="/">Home</Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '4rem 1.5rem' }}>
      <h1>{t(film.title)}</h1>
      <Link to="/#featured">Back</Link>
    </main>
  )
}
