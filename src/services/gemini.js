import { GoogleGenAI, Type } from '@google/genai'

const MODEL = 'gemini-2.5-flash'

const READINESS_CARD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    household_summary: {
      type: Type.STRING,
      description: 'One sentence summarizing who lives in the household and their key vulnerabilities.',
    },
    risk_tier: {
      type: Type.STRING,
      enum: ['moderate', 'high', 'severe'],
      description: 'Overall flood vulnerability tier for this household.',
    },
    evacuation_trigger: {
      type: Type.STRING,
      description: 'A single concrete "if X happens, leave now" trigger tailored to this household, e.g. water level or timing cue.',
    },
    prioritized_checklist: {
      type: Type.ARRAY,
      minItems: 4,
      maxItems: 8,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: 'A specific, actionable preparedness step.' },
          reason: { type: Type.STRING, description: 'Why this matters for this specific household.' },
        },
        required: ['action', 'reason'],
      },
    },
    medicine_document_safety: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 5,
      items: { type: Type.STRING },
      description: 'Concrete steps to protect medicines and documents specific to this household.',
    },
    emergency_contacts_template: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Placeholder roles the family should fill in, e.g. "Nearest relative on higher floor: ____".',
    },
  },
  required: [
    'household_summary',
    'risk_tier',
    'evacuation_trigger',
    'prioritized_checklist',
    'medicine_document_safety',
    'emergency_contacts_template',
  ],
}

const cardCache = new Map()

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file (see .env.example).')
  }
  return new GoogleGenAI({ apiKey })
}

const SYSTEM_PROMPT = `You are a monsoon flood-preparedness assistant for households in Indian cities prone to urban flooding (e.g. Bengaluru low-lying layouts near stormwater drains).
Given a messy, informal description of a household, produce a personalized, specific flood readiness plan — not a generic checklist. Name the household's actual people and vulnerabilities (e.g. an elderly or diabetic family member, small children, mobility issues, ground floor, no vehicle, past flooding experience) directly in the checklist reasons and evacuation trigger. Keep language plain and practical for a non-expert reader.`

export function isValidCard(card) {
  if (!card || typeof card !== 'object') return false
  if (typeof card.household_summary !== 'string' || !card.household_summary.trim()) return false
  if (!['moderate', 'high', 'severe'].includes(card.risk_tier)) return false
  if (typeof card.evacuation_trigger !== 'string' || !card.evacuation_trigger.trim()) return false
  if (!Array.isArray(card.prioritized_checklist) || card.prioritized_checklist.length === 0) return false
  if (!card.prioritized_checklist.every((i) => i && typeof i.action === 'string' && typeof i.reason === 'string')) return false
  if (!Array.isArray(card.medicine_document_safety) || card.medicine_document_safety.length === 0) return false
  if (!Array.isArray(card.emergency_contacts_template) || card.emergency_contacts_template.length === 0) return false
  return true
}

export async function generateReadinessCard(householdDescription) {
  const cacheKey = householdDescription.trim()
  if (cardCache.has(cacheKey)) {
    return cardCache.get(cacheKey)
  }

  const ai = getClient()

  let response
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: householdDescription }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: READINESS_CARD_SCHEMA,
      },
    })
  } catch (err) {
    throw new Error(`Could not reach Gemini: ${err.message || 'unknown error'}`)
  }

  const rawText = response?.text
  if (!rawText) {
    throw new Error('Gemini returned an empty response.')
  }

  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('Gemini returned a response that was not valid JSON.')
  }

  if (!isValidCard(parsed)) {
    throw new Error("Gemini's response was missing required fields.")
  }

  cardCache.set(cacheKey, parsed)
  return parsed
}
