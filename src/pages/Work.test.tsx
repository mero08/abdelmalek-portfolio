import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    renderWork('balbaa')
    expect(screen.getByRole('heading', { name: /balbaa/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/#featured')
    expect(screen.getByRole('link', { name: /play balbaa/i })).toHaveAttribute(
      'href',
      '/work/balbaa/watch',
    )
    expect(screen.getByRole('link', { name: /aziz el sham opening/i })).toHaveAttribute(
      'href',
      '/work/aziz-el-sham-opening',
    )
  })

  it('shows not found for unknown slug', () => {
    renderWork('missing')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })

  it('updates cover images when navigating to another film', async () => {
    const user = userEvent.setup()
    renderWork('balbaa')

    expect(screen.getAllByRole('img', { name: /balbaa/i })[0]).toHaveAttribute(
      'src',
      expect.stringContaining('WYwJRndsxGc'),
    )

    await user.click(screen.getByRole('link', { name: /aziz el sham opening/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('img', { name: /aziz el sham opening/i })[0]).toHaveAttribute(
        'src',
        expect.stringContaining('NyILPGqIHd0'),
      )
    })
  })
})
