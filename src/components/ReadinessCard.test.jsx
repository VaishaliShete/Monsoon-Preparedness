import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReadinessCard from './ReadinessCard'

const card = {
  household_summary: 'A family of four on the ground floor near a drain.',
  risk_tier: 'severe',
  evacuation_trigger: 'If water crosses the doorstep, leave immediately.',
  prioritized_checklist: [
    { action: 'Move medicines up', reason: 'Ground floor floods first.' },
    { action: 'Pack a go-bag', reason: 'No car for a quick exit.' },
  ],
  medicine_document_safety: ['Store insulin in a waterproof bag on a high shelf.'],
  emergency_contacts_template: ['Nearest relative on a higher floor: ____'],
}

describe('ReadinessCard', () => {
  it('renders the household summary and risk tier', () => {
    render(<ReadinessCard card={card} />)
    expect(screen.getByText(card.household_summary)).toBeInTheDocument()
    expect(screen.getByText('Severe Risk')).toBeInTheDocument()
  })

  it('renders the evacuation trigger', () => {
    render(<ReadinessCard card={card} />)
    expect(screen.getByText(card.evacuation_trigger)).toBeInTheDocument()
  })

  it('renders every checklist item', () => {
    render(<ReadinessCard card={card} />)
    for (const item of card.prioritized_checklist) {
      expect(screen.getByText(item.action)).toBeInTheDocument()
    }
  })
})
