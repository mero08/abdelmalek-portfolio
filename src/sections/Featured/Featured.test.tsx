import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Featured } from './Featured'

function firstFilmLink() {
  const link = screen
    .getAllByRole('link')
    .find((el) => el.getAttribute('href') === '/work/balbaa')
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
    expect(firstFilmLink()).toHaveAttribute('href', '/work/balbaa')
  })

  it('marks the first film active by default', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Featured />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(firstFilmLink()).toHaveAttribute('data-active', 'true')
  })
})
