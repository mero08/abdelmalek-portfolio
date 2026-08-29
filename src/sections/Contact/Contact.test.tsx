import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Contact } from './Contact'

describe('Contact section', () => {
  it('renders email wipe, phone, and socials', () => {
    render(
      <LocaleProvider>
        <Contact />
      </LocaleProvider>,
    )

    const email = screen.getByRole('link', { name: /hello@abdelmalek\.studio/i })
    expect(email).toHaveAttribute('href', 'mailto:hello@abdelmalek.studio')

    const phone = screen.getByRole('link', { name: /\+20 1025735207/i })
    expect(phone).toHaveAttribute('href', 'tel:+201025735207')

    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/201025735207',
    )
    expect(screen.queryByText(/available for selective projects/i)).not.toBeInTheDocument()
  })
})
