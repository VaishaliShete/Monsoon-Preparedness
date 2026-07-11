import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { generateReadinessCard, localizeReadinessCard } from './services/gemini'

vi.mock('./services/gemini', () => ({
  generateReadinessCard: vi.fn(),
  localizeReadinessCard: vi.fn(),
  SUPPORTED_LANGUAGES: [
    { code: 'kn', name: 'Kannada' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
  ],
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

  it('fetches and renders a translation when a language is selected', async () => {
    generateReadinessCard.mockResolvedValueOnce(validCard)
    localizeReadinessCard.mockResolvedValueOnce({
      household_summary: 'ನೆಲ ಮಹಡಿಯಲ್ಲಿ ವಾಸಿಸುವ ಕುಟುಂಬ.',
      evacuation_trigger: 'ನೀರು ಬಂದರೆ ತಕ್ಷಣ ಹೊರಡಿ.',
      prioritized_checklist: [{ action: 'ಔಷಧಿ ಸರಿಸಿ', reason: 'ಮೊದಲು ಪ್ರವಾಹ.' }],
      medicine_document_safety: ['ಇನ್ಸುಲಿನ್ ಸುರಕ್ಷಿತವಾಗಿಡಿ.'],
      emergency_contacts_template: ['ಸಂಬಂಧಿ: ____'],
    })
    render(<App />)
    await userEvent.type(
      screen.getByLabelText(/tell us about your household/i),
      'I live on the ground floor with my elderly mother and two kids.',
    )
    await userEvent.click(screen.getByRole('button', { name: /generate readiness card/i }))
    await screen.findByText(validCard.household_summary)

    await userEvent.click(screen.getByRole('button', { name: /kannada/i }))

    expect(await screen.findByText('ನೆಲ ಮಹಡಿಯಲ್ಲಿ ವಾಸಿಸುವ ಕುಟುಂಬ.')).toBeInTheDocument()
    expect(localizeReadinessCard).toHaveBeenCalledWith(validCard, 'Kannada')
  })
})
