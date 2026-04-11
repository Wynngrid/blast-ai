// Specialization taxonomy per D-12 (predefined + Other), D-13 (problem-centric labels)
// Categories map to enterprise AI challenges, not practitioner skill jargon

export const SPECIALIZATION_CATEGORIES = [
  {
    id: 'ai-strategy',
    label: 'AI Strategy & Roadmapping',
    description: 'Where should we start with AI?',
    icon: 'Compass',
  },
  {
    id: 'llm-genai',
    label: 'LLM & GenAI Implementation',
    description: 'Building with GPT, Claude, or similar',
    icon: 'Sparkles',
  },
  {
    id: 'ml-development',
    label: 'ML Model Development',
    description: 'Custom prediction models and algorithms',
    icon: 'Brain',
  },
  {
    id: 'mlops-production',
    label: 'MLOps & Production',
    description: 'Getting models into production reliably',
    icon: 'Server',
  },
  {
    id: 'data-engineering',
    label: 'Data Engineering for AI',
    description: 'Making data AI-ready',
    icon: 'Database',
  },
  {
    id: 'computer-vision',
    label: 'Computer Vision',
    description: 'Processing images and video',
    icon: 'Eye',
  },
  {
    id: 'nlp-language',
    label: 'NLP & Language AI',
    description: 'Understanding and generating text',
    icon: 'MessageSquare',
  },
  {
    id: 'ai-product-ux',
    label: 'AI Product & UX',
    description: 'How users interact with AI features',
    icon: 'Layers',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Specify your niche specialization',
    icon: 'Plus',
  },
] as const

export type SpecializationId = (typeof SPECIALIZATION_CATEGORIES)[number]['id']

// Session durations per D-05: 20, 40, 60, 90 minutes
export const SESSION_DURATIONS = [20, 40, 60, 90] as const
export type SessionDuration = (typeof SESSION_DURATIONS)[number]

// Slot configuration per D-05, D-06
export const SLOT_CONFIG = {
  BASE_SLOT_MINUTES: 30,
  BUFFER_MINUTES: 15,
  // Session types map to slot counts (per D-05)
  // 20 min = 1 slot (special short session)
  // 40 min = 1.5 slots rounded to 2 slots (30 + 10 buffer)
  // 60 min = 2 slots
  // 90 min = 3 slots
  SESSION_TYPE_SLOTS: {
    20: 1,
    40: 2,
    60: 2,
    90: 3,
  } as const,
} as const

/**
 * Calculate total time needed for a session including buffer
 * Per D-05 and D-06
 */
export function getSessionTotalMinutes(duration: SessionDuration): number {
  return duration + SLOT_CONFIG.BUFFER_MINUTES
}

/**
 * Get the number of 30-minute slots needed for a session type
 */
export function getSlotsForSession(duration: SessionDuration): number {
  return SLOT_CONFIG.SESSION_TYPE_SLOTS[duration]
}
