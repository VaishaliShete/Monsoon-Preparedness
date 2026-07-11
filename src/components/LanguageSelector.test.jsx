import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LanguageSelector from './LanguageSelector'
import { SUPPORTED_LANGUAGES } from '../services/gemini'

describe('LanguageSelector', () => {
  it('renders an English-only button plus every supported language', () => {
    render(<LanguageSelector activeLanguage={null} onSelect={() => {}} loading={false} />)
    expect(screen.getByRole('button', { name: /english only/i })).toBeInTheDocument()
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(screen.getByRole('button', { name: new RegExp(lang.name) })).toBeInTheDocument()
    }
  })

  it('calls onSelect with the language code when clicked', async () => {
    const onSelect = vi.fn()
    render(<LanguageSelector activeLanguage={null} onSelect={onSelect} loading={false} />)
    await userEvent.click(screen.getByRole('button', { name: new RegExp(SUPPORTED_LANGUAGES[0].name) }))
    expect(onSelect).toHaveBeenCalledWith(SUPPORTED_LANGUAGES[0].code)
  })

  it('marks the active language button as pressed', () => {
    render(
      <LanguageSelector activeLanguage={SUPPORTED_LANGUAGES[0].code} onSelect={() => {}} loading={false} />,
    )
    expect(
      screen.getByRole('button', { name: new RegExp(SUPPORTED_LANGUAGES[0].name) }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('disables language buttons while loading', () => {
    render(<LanguageSelector activeLanguage={null} onSelect={() => {}} loading />)
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(screen.getByRole('button', { name: new RegExp(lang.name) })).toBeDisabled()
    }
  })
})
