import { Route, Routes } from 'react-router-dom'
import { CircleCursor } from './components/CursorLens/CircleCursor'
import { CursorLensProvider } from './components/CursorLens/CursorLensContext'
import { GlowCursor } from './components/GlowCursor/GlowCursor'
import { Nav } from './components/Nav/Nav'
import { LocaleProvider } from './i18n/LocaleContext'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Watch } from './pages/Watch'
import { Work } from './pages/Work'
import './styles/global.css'

export default function App() {
  return (
    <LocaleProvider>
      <CursorLensProvider>
        <GlowCursor />
        <CircleCursor />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<Work />} />
          <Route path="/work/:slug/watch" element={<Watch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CursorLensProvider>
    </LocaleProvider>
  )
}
