import { Route, Routes } from 'react-router-dom'
import { CircleCursor } from './components/CursorLens/CircleCursor'
import { CursorLensProvider } from './components/CursorLens/CursorLensContext'
import { Nav } from './components/Nav/Nav'
import { Threads } from './components/Threads/Threads'
import { LocaleProvider } from './i18n/LocaleContext'
import { ContactMessage } from './pages/ContactMessage'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Watch } from './pages/Watch'
import { Work } from './pages/Work'
import './styles/global.css'

export default function App() {
  return (
    <LocaleProvider>
      <CursorLensProvider>
        <Threads hideOverHero />
        <CircleCursor />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact/message" element={<ContactMessage />} />
          <Route path="/work/:slug" element={<Work />} />
          <Route path="/work/:slug/watch" element={<Watch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CursorLensProvider>
    </LocaleProvider>
  )
}
