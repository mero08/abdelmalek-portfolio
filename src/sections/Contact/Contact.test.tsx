import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Contact } from './Contact'

describe('Contact section', () => {
  it('renders email wipe, phone, and socials', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Contact />
        </LocaleProvider>
      </MemoryRouter>,
    )

    const email = screen.getByRole('link', { name: /abdelmalekmarawan123@gmail\.com/i })
    expect(email).toHaveAttribute('href', '/contact/message')

    const phone = screen.getByRole('link', { name: /\+20 1154085914/i })
    expect(phone).toHaveAttribute('href', 'tel:+201154085914')

    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/201154085914',
    )
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
      'href',
      'https://www.instagram.com/abdelmalek.marawan/',
    )
  })
})
