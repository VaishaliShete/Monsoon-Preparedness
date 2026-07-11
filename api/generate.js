import { GoogleGenAI } from '@google/genai'
import { MODEL, READINESS_CARD_SCHEMA, SYSTEM_PROMPT, isValidCard } from '../src/utils/cardSchema.js'

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
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY')
    }

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: householdDescription }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: READINESS_CARD_SCHEMA,
      },
    })

    const rawText = response?.text
    if (!rawText) {
      throw new Error('Empty response from Gemini')
    }

    const parsed = JSON.parse(rawText)
    if (!isValidCard(parsed)) {
      throw new Error('Malformed card from Gemini')
    }

    res.status(200).json({ card: parsed })
  } catch (err) {
    console.error('generate.js error:', err)
    res.status(502).json({ error: 'Something went wrong, please try again' })
  }
}
