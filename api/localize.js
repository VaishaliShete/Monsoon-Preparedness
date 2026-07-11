import { GoogleGenAI } from '@google/genai'
import { MODEL, LOCALIZED_CARD_SCHEMA, LOCALIZATION_SYSTEM_PROMPT, isValidLocalizedCard } from '../src/utils/cardSchema.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { card, languageName } = req.body ?? {}
  if (!card || typeof card !== 'object' || typeof languageName !== 'string' || !languageName.trim()) {
    res.status(400).json({ error: 'card and languageName are required' })
    return
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY')
    }

    const ai = new GoogleGenAI({ apiKey })
    const translatable = { ...card }
    delete translatable.risk_tier

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Target language: ${languageName}\n\nEnglish plan:\n${JSON.stringify(translatable, null, 2)}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: LOCALIZATION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: LOCALIZED_CARD_SCHEMA,
      },
    })

    const rawText = response?.text
    if (!rawText) {
      throw new Error('Empty response from Gemini')
    }

    const parsed = JSON.parse(rawText)
    if (!isValidLocalizedCard(parsed)) {
      throw new Error('Malformed localized card from Gemini')
    }

    res.status(200).json({ card: parsed })
  } catch (err) {
    console.error('localize.js error:', err)
    res.status(502).json({ error: 'Something went wrong, please try again' })
  }
}
