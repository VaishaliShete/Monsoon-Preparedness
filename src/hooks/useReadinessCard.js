import { useRef, useState } from 'react'
import { generateReadinessCard } from '../services/gemini'
import { validateDescription } from '../utils/sanitize'

// Owns the primary generate flow: input, validation, request status, and
// the resulting card. A monotonically increasing request id discards
// results from a superseded request (e.g. the user edits and resubmits
// before the first call returns).
export function useReadinessCard() {
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [card, setCard] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const requestIdRef = useRef(0)

  async function generate(e) {
    e.preventDefault()

    const { valid, value, error } = validateDescription(description)
    if (!valid) {
      setErrorMessage(error)
      setStatus('error')
      return
    }

    const requestId = ++requestIdRef.current
    setStatus('loading')
    setErrorMessage('')
    try {
      const result = await generateReadinessCard(value)
      if (requestIdRef.current !== requestId) return // a newer request superseded this one
      setCard(result)
      setStatus('success')
    } catch (err) {
      if (requestIdRef.current !== requestId) return
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  function retry() {
    setStatus('idle')
    setErrorMessage('')
  }

  return { description, setDescription, status, card, errorMessage, generate, retry }
}
