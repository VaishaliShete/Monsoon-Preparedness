import { describe, expect, it } from 'vitest'
import { MAX_DESCRIPTION_LENGTH, sanitizeDescription, validateDescription } from './sanitize'

describe('sanitizeDescription', () => {
  it('strips HTML tags and their content', () => {
    expect(sanitizeDescription('<script>alert(1)</script>hello')).toBe('hello')
  })

  it('strips tags but keeps visible text', () => {
    expect(sanitizeDescription('<b>hello</b> world')).toBe('hello world')
  })

  it('trims whitespace', () => {
    expect(sanitizeDescription('   hello world   ')).toBe('hello world')
  })

  it('truncates to the max length', () => {
    const long = 'a'.repeat(MAX_DESCRIPTION_LENGTH + 500)
    expect(sanitizeDescription(long)).toHaveLength(MAX_DESCRIPTION_LENGTH)
  })

  it('handles null/undefined input', () => {
    expect(sanitizeDescription(undefined)).toBe('')
    expect(sanitizeDescription(null)).toBe('')
  })
})

describe('validateDescription', () => {
  it('rejects empty input', () => {
    const result = validateDescription('   ')
    expect(result.valid).toBe(false)
  })

  it('rejects input under 20 characters', () => {
    const result = validateDescription('too short')
    expect(result.valid).toBe(false)
  })

  it('accepts a reasonable description and returns the sanitized value', () => {
    const result = validateDescription('  I live on the ground floor near a drain.  ')
    expect(result.valid).toBe(true)
    expect(result.value).toBe('I live on the ground floor near a drain.')
  })
})
