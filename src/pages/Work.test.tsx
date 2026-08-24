import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import { Work } from './Work'

function renderWork(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/work/${slug}`]}>
      <LocaleProvider>
        <Routes>
          <Route path="/work/:slug" element={<Work />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

describe('Work page', () => {
  it('renders film story and navigation', () => {
    renderWork('night-drive')
    expect(screen.getByRole('heading', { name: /night drive/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/#featured')
    expect(screen.getByRole('link', { name: /brand pulse/i })).toHaveAttribute(
      'href',
      '/work/brand-pulse',
    )
  })

  it('shows not found for unknown slug', () => {
    renderWork('missing')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
