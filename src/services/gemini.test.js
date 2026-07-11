import { describe, expect, it } from 'vitest'
import { isValidCard, isValidLocalizedCard } from './gemini'

const validCard = {
  household_summary: 'A family of four on the ground floor.',
  risk_tier: 'high',
  evacuation_trigger: 'If water crosses the doorstep, leave immediately.',
  prioritized_checklist: [{ action: 'Move medicines up', reason: 'Ground floor floods first.' }],
  medicine_document_safety: ['Store insulin in a waterproof bag on a high shelf.'],
  emergency_contacts_template: ['Nearest relative on a higher floor: ____'],
}

describe('isValidCard', () => {
  it('accepts a well-formed card', () => {
    expect(isValidCard(validCard)).toBe(true)
  })

  it('rejects null/undefined', () => {
    expect(isValidCard(null)).toBe(false)
    expect(isValidCard(undefined)).toBe(false)
  })

  it('rejects an invalid risk_tier', () => {
    expect(isValidCard({ ...validCard, risk_tier: 'extreme' })).toBe(false)
  })

  it('rejects a missing checklist', () => {
    const { prioritized_checklist: _omit, ...rest } = validCard
    expect(isValidCard(rest)).toBe(false)
  })

  it('rejects a checklist item missing a reason', () => {
    expect(
      isValidCard({ ...validCard, prioritized_checklist: [{ action: 'Do a thing' }] }),
    ).toBe(false)
  })

  it('rejects an empty medicine_document_safety array', () => {
    expect(isValidCard({ ...validCard, medicine_document_safety: [] })).toBe(false)
  })
})

describe('isValidLocalizedCard', () => {
  const { risk_tier: _omit, ...localizedCard } = validCard

  it('accepts a well-formed localized card without risk_tier', () => {
    expect(isValidLocalizedCard(localizedCard)).toBe(true)
  })

  it('rejects null/undefined', () => {
    expect(isValidLocalizedCard(null)).toBe(false)
    expect(isValidLocalizedCard(undefined)).toBe(false)
  })

  it('rejects a missing household_summary', () => {
    const { household_summary: _h, ...rest } = localizedCard
    expect(isValidLocalizedCard(rest)).toBe(false)
  })

  it('rejects an empty emergency_contacts_template array', () => {
    expect(isValidLocalizedCard({ ...localizedCard, emergency_contacts_template: [] })).toBe(false)
  })
})
