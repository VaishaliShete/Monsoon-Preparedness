import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { generateReadinessCard } from './services/gemini'

vi.mock('./services/gemini', () => ({
  generateReadinessCard: vi.fn(),
}))

const validCard = {
  household_summary: 'A family of four on the ground floor.',
  risk_tier: 'high',
  evacuation_trigger: 'If water crosses the doorstep, leave immediately.',
  prioritized_checklist: [{ action: 'Move medicines up', reason: 'Ground floor floods first.' }],
  medicine_document_safety: ['Store insulin in a waterproof bag on a high shelf.'],
  emergency_contacts_template: ['Nearest relative on a higher floor: ____'],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('App', () => {
  it('shows a validation error for too-short input instead of calling Gemini', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText(/tell us about your household/i), 'too short')
    await userEvent.click(screen.getByRole('button', { name: /generate readiness card/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 20 characters/i)
    expect(generateReadinessCard).not.toHaveBeenCalled()
  })

  it('renders the readiness card on success', async () => {
    generateReadinessCard.mockResolvedValueOnce(validCard)
    render(<App />)
    await userEvent.type(
      screen.getByLabelText(/tell us about your household/i),
      'I live on the ground floor with my elderly mother and two kids.',
    )
    await userEvent.click(screen.getByRole('button', { name: /generate readiness card/i }))

    expect(await screen.findByText(validCard.household_summary)).toBeInTheDocument()
  })

  it('shows the error state when generation fails', async () => {
    generateReadinessCard.mockRejectedValueOnce(new Error('Gemini exploded'))
    render(<App />)
    await userEvent.type(
      screen.getByLabelText(/tell us about your household/i),
      'I live on the ground floor with my elderly mother and two kids.',
    )
    await userEvent.click(screen.getByRole('button', { name: /generate readiness card/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Gemini exploded')
  })

  it('lets the user retry after an error', async () => {
    generateReadinessCard.mockRejectedValueOnce(new Error('Gemini exploded'))
    render(<App />)
    await userEvent.type(
      screen.getByLabelText(/tell us about your household/i),
      'I live on the ground floor with my elderly mother and two kids.',
    )
    await userEvent.click(screen.getByRole('button', { name: /generate readiness card/i }))
    await screen.findByRole('alert')

    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
