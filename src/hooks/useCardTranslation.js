import { useEffect, useRef, useState } from 'react'
import { localizeReadinessCard, SUPPORTED_LANGUAGES } from '../services/gemini'

// Owns the bilingual-localization flow for a given card. Resets whenever
// `card` changes identity (a new successful generation) — the translation
// panel is only ever rendered alongside a successful card, so this is
// equivalent to resetting eagerly at the start of a new generate request.
export function useCardTranslation(card) {
  const [language, setLanguage] = useState(null) // null | language code
  const [translation, setTranslation] = useState(null)
  const [translationStatus, setTranslationStatus] = useState('idle') // idle | loading | error
  const [translationError, setTranslationError] = useState('')
  const requestIdRef = useRef(0)

  useEffect(() => {
    setLanguage(null)
    setTranslation(null)
    setTranslationStatus('idle')
    setTranslationError('')
  }, [card])

  async function selectLanguage(code) {
    setLanguage(code)
    setTranslationError('')

    if (code === null || !card) {
      setTranslation(null)
      setTranslationStatus('idle')
      return
    }

    const languageName = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name
    if (!languageName) return

    const requestId = ++requestIdRef.current
    setTranslationStatus('loading')
    try {
      const result = await localizeReadinessCard(card, languageName)
      if (requestIdRef.current !== requestId) return
      setTranslation(result)
      setTranslationStatus('idle')
    } catch (err) {
      if (requestIdRef.current !== requestId) return
      setTranslationError(err.message || 'Could not translate the card. Please try again.')
      setTranslationStatus('error')
    }
  }

  return { language, translation, translationStatus, translationError, selectLanguage }
}
