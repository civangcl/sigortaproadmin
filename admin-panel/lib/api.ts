// lib/api.ts
// Real API client for Fırat Ece Sigorta Backend (http://localhost:3001)

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface ApiOffer {
  id: number
  licensePlate: string
  fullName: string
  dateOfBirth: string // ISO date string
  phoneNumber: string
  status: string
  createdAt: string  // ISO timestamp
  // optional fields from the extended form
  tcKimlikNo?: string
  belgeNo?: string
}

export interface ApiResponse<T> {
  success: boolean
  count?: number
  data: T
}

/**
 * Fetch all offers from the backend.
 */
export async function fetchOffers(): Promise<ApiOffer[]> {
  const res = await fetch(`${API_BASE}/api/offers`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  const json: ApiResponse<ApiOffer[]> = await res.json()
  return json.data ?? []
}

/**
 * Update an offer's status on the backend.
 * (PATCH /api/offers/:id — implement on backend if needed, graceful no-op if not)
 */
export async function updateOfferStatus(
  id: number,
  status: string,
): Promise<void> {
  await fetch(`${API_BASE}/api/offers/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).catch(() => {
    // silently fail — backend endpoint may not exist yet
  })
}
