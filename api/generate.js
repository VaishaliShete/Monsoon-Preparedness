import { MODEL, READINESS_CARD_SCHEMA, SYSTEM_PROMPT, isValidCard } from '../src/utils/cardSchema.js'
import { generateStructuredContent } from '../src/utils/geminiClient.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { householdDescription } = req.body ?? {}
  if (typeof householdDescription !== 'string' || !householdDescription.trim()) {
    res.status(400).json({ error: 'householdDescription is required' })
    return
  }

  try {
    const card = await generateStructuredContent({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: householdDescription }] }],
      schema: READINESS_CARD_SCHEMA,
      validate: isValidCard,
    })

    res.status(200).json({ card })
  } catch (err) {
    console.error('generate.js error:', err)
    res.status(502).json({ error: 'Something went wrong, please try again' })
  }
}
