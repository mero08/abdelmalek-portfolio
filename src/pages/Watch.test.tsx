import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import { Watch } from './Watch'

function renderWatch(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/work/${slug}/watch`]}>
      <LocaleProvider>
        <Routes>
          <Route path="/work/:slug/watch" element={<Watch />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

describe('Watch page', () => {
  it('embeds youtube with autoplay for a known film', () => {
    renderWatch('baltafsil-waleed')
    const iframe = screen.getByTitle(/baltafsil/i)
    expect(iframe.getAttribute('src')).toContain(
      'https://www.youtube-nocookie.com/embed/045VJIe1fnU',
    )
    expect(iframe.getAttribute('src')).toContain('autoplay=1')
    expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
  })

  it('links adjacent films to their watch pages', () => {
    renderWatch('aziz-el-sham-opening')
    expect(screen.getByRole('link', { name: /balbaa/i })).toHaveAttribute(
      'href',
      '/work/balbaa/watch',
    )
    expect(screen.getByRole('link', { name: /samurai seven/i })).toHaveAttribute(
      'href',
      '/work/samurai-seven/watch',
    )
  })

  it('loads a fresh embed when navigating to another film', async () => {
    const user = userEvent.setup()
    renderWatch('aziz-el-sham-opening')

    await user.click(screen.getByRole('link', { name: /samurai seven/i }))

    await waitFor(() => {
      const iframe = screen.getByTitle(/samurai seven/i)
      expect(iframe.getAttribute('src')).toContain('7Z1FKSqVJYg')
    })
  })
})