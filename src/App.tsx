import { Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav/Nav'
import { LocaleProvider } from './i18n/LocaleContext'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Work } from './pages/Work'
import './styles/global.css'

export default function App() {
  return (
    <LocaleProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<Work />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocaleProvider>
  )
}
