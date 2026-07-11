import { SUPPORTED_LANGUAGES, isValidCard, isValidLocalizedCard } from '../utils/cardSchema'

export { SUPPORTED_LANGUAGES, isValidCard, isValidLocalizedCard }

const cardCache = new Map()
const localizationCache = new Map()

async function postJson(url, body) {
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The server returned an unexpected response.')
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong, please try again')
  }

  return data
}

export async function generateReadinessCard(householdDescription) {
  const cacheKey = householdDescription.trim()
  if (cardCache.has(cacheKey)) {
    return cardCache.get(cacheKey)
  }

  const data = await postJson('/api/generate', { householdDescription: cacheKey })

  if (!isValidCard(data.card)) {
    throw new Error("The server's response was missing required fields.")
  }

  cardCache.set(cacheKey, data.card)
  return data.card
}

export async function localizeReadinessCard(card, languageName) {
  const cacheKey = `${languageName}::${JSON.stringify(card)}`
  if (localizationCache.has(cacheKey)) {
    return localizationCache.get(cacheKey)
  }

  const data = await postJson('/api/localize', { card, languageName })

  if (!isValidLocalizedCard(data.card)) {
    throw new Error("The server's translated response was missing required fields.")
  }

  localizationCache.set(cacheKey, data.card)
  return data.card
}
