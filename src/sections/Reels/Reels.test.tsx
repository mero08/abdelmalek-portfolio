import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Reels } from './Reels'

vi.mock('../../content/reels', () => ({
  reels: [],
}))

describe('Reels', () => {
  it('renders nothing when empty', () => {
    const { container } = render(
      <LocaleProvider>
        <Reels />
      </LocaleProvider>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
