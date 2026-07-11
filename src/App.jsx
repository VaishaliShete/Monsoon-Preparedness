import { useState } from 'react'
import './App.css'
import SampleInputButtons from './components/SampleInputButtons'
import ReadinessCard from './components/ReadinessCard'
import ErrorState from './components/ErrorState'
import { generateReadinessCard } from './services/gemini'

export default function App() {
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [card, setCard] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleGenerate(e) {
    e.preventDefault()
    if (!description.trim()) return

    setStatus('loading')
    setErrorMessage('')
    try {
      const result = await generateReadinessCard(description)
      setCard(result)
      setStatus('success')
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  function handleRetry() {
    setStatus('idle')
    setErrorMessage('')
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
        />

        <SampleInputButtons onPick={setDescription} disabled={status === 'loading'} />

        <button type="submit" disabled={status === 'loading' || !description.trim()}>
          {status === 'loading' ? 'Generating…' : 'Generate Readiness Card'}
        </button>
      </form>

      <section aria-live="polite" className="app__result">
        {status === 'loading' && <p className="loading-text">Building your personalized plan…</p>}
        {status === 'error' && <ErrorState message={errorMessage} onRetry={handleRetry} />}
        {status === 'success' && card && <ReadinessCard card={card} />}
      </section>
    </main>
  )
}
