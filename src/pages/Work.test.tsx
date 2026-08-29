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
    renderWork('shams-w-hawa')
    expect(screen.getByRole('heading', { name: /shams w hawa/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/#featured')
    expect(screen.getByRole('link', { name: /play shams w hawa/i })).toHaveAttribute(
      'href',
      '/work/shams-w-hawa/watch',
    )
    expect(screen.getByRole('link', { name: /azbet el khanazir/i })).toHaveAttribute(
      'href',
      '/work/azbet-el-khanazir',
    )
  })

  it('shows not found for unknown slug', () => {
    renderWork('missing')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })

  it('updates cover images when navigating to another film', async () => {
    const user = userEvent.setup()
    renderWork('shams-w-hawa')

    expect(screen.getAllByRole('img', { name: /shams w hawa/i })[0]).toHaveAttribute(
      'src',
      expect.stringContaining('sUpNxFQkyQg'),
    )

    await user.click(screen.getByRole('link', { name: /azbet el khanazir/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('img', { name: /azbet el khanazir/i })[0]).toHaveAttribute(
        'src',
        expect.stringContaining('ZvOucenhvmI'),
      )
    })
  })
})
