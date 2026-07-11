import './App.css'
import SampleInputButtons from './components/SampleInputButtons'
import ReadinessCard from './components/ReadinessCard'
import ErrorState from './components/ErrorState'
import LanguageSelector from './components/LanguageSelector'
import { useReadinessCard } from './hooks/useReadinessCard'
import { useCardTranslation } from './hooks/useCardTranslation'
import { MAX_DESCRIPTION_LENGTH } from './utils/sanitize'

export default function App() {
  const { description, setDescription, status, card, errorMessage, generate, retry } = useReadinessCard()
  const { language, translation, translationStatus, translationError, selectLanguage } =
    useCardTranslation(card)

  return (
    <main className="app">
      <header className="app__header">
        <h1>Household Flood Readiness Card</h1>
        <p>
          Describe your household in your own words — who lives there, your floor level, and any past
          flooding — and get a personalized readiness plan.
        </p>
      </header>

      <form onSubmit={generate} className="app__form">
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
        {status === 'error' && <ErrorState message={errorMessage} onRetry={retry} />}
        {status === 'success' && card && (
          <>
            <LanguageSelector
              activeLanguage={language}
              onSelect={selectLanguage}
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
