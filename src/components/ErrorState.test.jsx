import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  it('shows the error message', () => {
    render(<ErrorState message="Something broke" onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something broke')
  })

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Something broke" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
