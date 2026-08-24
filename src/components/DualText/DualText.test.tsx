import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DualText } from './DualText'

describe('DualText', () => {
  it('reveals alternate text on hover', async () => {
    const user = userEvent.setup()
    render(<DualText primary="Primary bio" alt="Alternate bio" />)
    expect(screen.getByText('Primary bio')).toBeInTheDocument()
    await user.hover(screen.getByTestId('dual-text'))
    expect(screen.getByTestId('dual-text')).toHaveAttribute('data-revealed', 'true')
  })
})
