import { render, screen, within } from '@testing-library/react'
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

  it('renders stacked social icon links', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Nav />
        </LocaleProvider>
      </MemoryRouter>,
    )
    const socials = screen.getByTestId('corner-socials')
    expect(within(socials).getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/abdelmalek.marawan/',
    )
    expect(within(socials).getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://facebook.com/',
    )
    expect(within(socials).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/201154085914',
    )
  })
})
