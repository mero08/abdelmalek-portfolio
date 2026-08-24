import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Featured } from './Featured'

function nightDriveLink() {
  const link = screen
    .getAllByRole('link')
    .find((el) => el.getAttribute('href') === '/work/night-drive')
  expect(link).toBeTruthy()
  return link!
}

describe('Featured', () => {
  it('links each film to its work page', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Featured />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(nightDriveLink()).toHaveAttribute('href', '/work/night-drive')
  })

  it('marks the first film active by default', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Featured />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(nightDriveLink()).toHaveAttribute('data-active', 'true')
  })
})
