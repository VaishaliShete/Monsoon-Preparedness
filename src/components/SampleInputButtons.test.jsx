import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SampleInputButtons from './SampleInputButtons'
import { SAMPLE_INPUTS } from '../data/sampleInputs'

describe('SampleInputButtons', () => {
  it('renders a button for every sample input', () => {
    render(<SampleInputButtons onPick={() => {}} disabled={false} />)
    for (const sample of SAMPLE_INPUTS) {
      expect(screen.getByRole('button', { name: sample.label })).toBeInTheDocument()
    }
  })

  it('calls onPick with the sample text when clicked', async () => {
    const onPick = vi.fn()
    render(<SampleInputButtons onPick={onPick} disabled={false} />)
    await userEvent.click(screen.getByRole('button', { name: SAMPLE_INPUTS[0].label }))
    expect(onPick).toHaveBeenCalledWith(SAMPLE_INPUTS[0].text)
  })

  it('disables all buttons when disabled is true', () => {
    render(<SampleInputButtons onPick={() => {}} disabled />)
    for (const sample of SAMPLE_INPUTS) {
      expect(screen.getByRole('button', { name: sample.label })).toBeDisabled()
    }
  })
})
