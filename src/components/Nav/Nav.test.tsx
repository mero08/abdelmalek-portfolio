import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Nav } from './Nav'

describe('Nav', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  })

  it('toggles language labels', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Nav />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ع' }))
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('renders socials as text links', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Nav />
        </LocaleProvider>
      </MemoryRouter>,
    )
    const instagram = screen
      .getAllByRole('link')
      .find((el) => el.getAttribute('href') === 'https://instagram.com/')
    expect(instagram).toBeTruthy()
    expect(instagram).toHaveTextContent('Instagram')
  })
})
