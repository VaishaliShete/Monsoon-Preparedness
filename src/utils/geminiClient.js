import { GoogleGenAI } from '@google/genai'

// Server-only: calls Gemini with a structured JSON schema and returns the
// parsed object. Throws on missing key, empty response, invalid JSON, or a
// response that fails `validate`. Callers decide what user-facing message
// to surface — this never leaks Gemini's raw error to the caller's caller.
export async function generateStructuredContent({ model, systemInstruction, contents, schema, validate }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  })

  const rawText = response?.text
  if (!rawText) {
    throw new Error('Empty response from Gemini')
  }

  const parsed = JSON.parse(rawText)
  if (!validate(parsed)) {
    throw new Error('Malformed response from Gemini')
  }

  return parsed
}
