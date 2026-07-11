import DOMPurify from 'dompurify'

export const MAX_DESCRIPTION_LENGTH = 2000
export const MIN_DESCRIPTION_LENGTH = 20

export function sanitizeDescription(input) {
  const stripped = DOMPurify.sanitize(input ?? '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  return stripped.trim().slice(0, MAX_DESCRIPTION_LENGTH)
}

export function validateDescription(input) {
  const clean = sanitizeDescription(input)
  if (!clean) {
    return { valid: false, error: 'Please describe your household before generating a card.' }
  }
  if (clean.length < MIN_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Please add a bit more detail (at least ${MIN_DESCRIPTION_LENGTH} characters).`,
    }
  }
  return { valid: true, value: clean }
}
