import { MODEL, LOCALIZED_CARD_SCHEMA, LOCALIZATION_SYSTEM_PROMPT, isValidLocalizedCard } from '../src/utils/cardSchema.js'
import { generateStructuredContent } from '../src/utils/geminiClient.js'

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
    const translatable = { ...card }
    delete translatable.risk_tier

    const localizedCard = await generateStructuredContent({
      model: MODEL,
      systemInstruction: LOCALIZATION_SYSTEM_PROMPT,
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
      schema: LOCALIZED_CARD_SCHEMA,
      validate: isValidLocalizedCard,
    })

    res.status(200).json({ card: localizedCard })
  } catch (err) {
    console.error('localize.js error:', err)
    res.status(502).json({ error: 'Something went wrong, please try again' })
  }
}
