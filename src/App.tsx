import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CircleCursor } from './components/CursorLens/CircleCursor'
import { CursorLensProvider } from './components/CursorLens/CursorLensContext'
import { Nav } from './components/Nav/Nav'
import { LocaleProvider } from './i18n/LocaleContext'
import { Home } from './pages/Home'
import './styles/global.css'

const Threads = lazy(() =>
  import('./components/Threads/Threads').then((m) => ({ default: m.Threads })),
)
const GlowCursor = lazy(() =>
  import('./components/GlowCursor/GlowCursor').then((m) => ({
    default: m.GlowCursor,
  })),
)
const ContactMessage = lazy(() =>
  import('./pages/ContactMessage').then((m) => ({ default: m.ContactMessage })),
)
const Work = lazy(() => import('./pages/Work').then((m) => ({ default: m.Work })))
const Watch = lazy(() =>
  import('./pages/Watch').then((m) => ({ default: m.Watch })),
)
const NotFound = lazy(() =>
  import('./pages/NotFound').then((m) => ({ default: m.NotFound })),
)

export default function App() {
  return (
    <LocaleProvider>
      <CursorLensProvider>
        <Suspense fallback={null}>
          <Threads hideOverHero />
          <GlowCursor />
        </Suspense>
        <CircleCursor />
        <Nav />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact/message" element={<ContactMessage />} />
            <Route path="/work/:slug" element={<Work />} />
            <Route path="/work/:slug/watch" element={<Watch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </CursorLensProvider>
    </LocaleProvider>
  )
}
