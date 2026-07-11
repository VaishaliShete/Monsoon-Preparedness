import { useRef, useState } from 'react'
import './App.css'
import SampleInputButtons from './components/SampleInputButtons'
import ReadinessCard from './components/ReadinessCard'
import ErrorState from './components/ErrorState'
import LanguageSelector from './components/LanguageSelector'
import { generateReadinessCard, localizeReadinessCard, SUPPORTED_LANGUAGES } from './services/gemini'
import { MAX_DESCRIPTION_LENGTH, validateDescription } from './utils/sanitize'

export default function App() {
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [card, setCard] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const requestIdRef = useRef(0)

  const [language, setLanguage] = useState(null) // null | language code
  const [translation, setTranslation] = useState(null)
  const [translationStatus, setTranslationStatus] = useState('idle') // idle | loading | error
  const [translationError, setTranslationError] = useState('')
  const translationRequestIdRef = useRef(0)

  async function handleGenerate(e) {
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
    setLanguage(null)
    setTranslation(null)
    setTranslationStatus('idle')
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

  function handleRetry() {
    setStatus('idle')
    setErrorMessage('')
  }

  async function handleLanguageSelect(code) {
    setLanguage(code)
    setTranslationError('')

    if (code === null || !card) {
      setTranslation(null)
      setTranslationStatus('idle')
      return
    }

    const languageName = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name
    if (!languageName) return

    const requestId = ++translationRequestIdRef.current
    setTranslationStatus('loading')
    try {
      const result = await localizeReadinessCard(card, languageName)
      if (translationRequestIdRef.current !== requestId) return
      setTranslation(result)
      setTranslationStatus('idle')
    } catch (err) {
      if (translationRequestIdRef.current !== requestId) return
      setTranslationError(err.message || 'Could not translate the card. Please try again.')
      setTranslationStatus('error')
    }
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Household Flood Readiness Card</h1>
        <p>
          Describe your household in your own words — who lives there, your floor level, and any past
          flooding — and get a personalized readiness plan.
        </p>
      </header>

      <form onSubmit={handleGenerate} className="app__form">
        <label htmlFor="household-description">Tell us about your household</label>
        <textarea
          id="household-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. I live on the ground floor near a stormwater drain with my elderly mother and two kids..."
          rows={6}
          maxLength={MAX_DESCRIPTION_LENGTH}
          aria-describedby="household-description-hint"
        />
        <p id="household-description-hint" className="app__hint">
          {description.length}/{MAX_DESCRIPTION_LENGTH} characters
        </p>

        <SampleInputButtons onPick={setDescription} disabled={status === 'loading'} />

        <button type="submit" disabled={status === 'loading' || !description.trim()}>
          {status === 'loading' ? 'Generating…' : 'Generate Readiness Card'}
        </button>
      </form>

      <section aria-live="polite" className="app__result">
        {status === 'loading' && <p className="loading-text">Building your personalized plan…</p>}
        {status === 'error' && <ErrorState message={errorMessage} onRetry={handleRetry} />}
        {status === 'success' && card && (
          <>
            <LanguageSelector
              activeLanguage={language}
              onSelect={handleLanguageSelect}
              loading={translationStatus === 'loading'}
            />
            {translationStatus === 'loading' && (
              <p className="loading-text">Translating your plan…</p>
            )}
            {translationStatus === 'error' && (
              <p className="translation-error" role="alert">
                {translationError}
              </p>
            )}
            <ReadinessCard card={card} translation={translation} />
          </>
        )}
      </section>
    </main>
  )
}
