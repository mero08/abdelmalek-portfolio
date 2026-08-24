import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main style={{ padding: '4rem 1.5rem' }}>
      <h1>404</h1>
      <Link to="/">Home</Link>
    </main>
  )
}
