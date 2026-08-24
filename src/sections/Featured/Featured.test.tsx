import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Featured } from './Featured'

describe('Featured', () => {
  it('links each film to its work page', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Featured />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /night drive/i })).toHaveAttribute(
      'href',
      '/work/night-drive',
    )
  })
})
