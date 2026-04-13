// Industry options for filtering per DISC-02
// Maps to enterprise verticals for practitioner discovery

export const INDUSTRIES = [
  { id: 'fintech', label: 'Fintech & Banking' },
  { id: 'healthcare', label: 'Healthcare & Life Sciences' },
  { id: 'ecommerce', label: 'E-commerce & Retail' },
  { id: 'saas', label: 'SaaS & Software' },
  { id: 'manufacturing', label: 'Manufacturing & Industrial' },
  { id: 'media', label: 'Media & Entertainment' },
  { id: 'education', label: 'Education & EdTech' },
  { id: 'logistics', label: 'Logistics & Supply Chain' },
  { id: 'energy', label: 'Energy & Utilities' },
  { id: 'government', label: 'Government & Public Sector' },
  { id: 'other', label: 'Other' },
] as const

export type IndustryId = (typeof INDUSTRIES)[number]['id']
