import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { About } from './About'

describe('About', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  })

  it('renders dual-text bio and stat cards', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <About />
        </LocaleProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('dual-text')).toBeInTheDocument()
    expect(screen.getByText('Videos edited')).toBeInTheDocument()
    expect(screen.getByText('Years in the cut')).toBeInTheDocument()
    expect(screen.getByText('Clients & collaborators')).toBeInTheDocument()
    expect(screen.getAllByText(/^0+/).length).toBeGreaterThan(0)
  })
})
