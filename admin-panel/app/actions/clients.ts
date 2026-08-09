const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function getClients() {
  const res = await fetch(`${API_URL}/clients`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function createClient(data: any) {
  const res = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateClient(id: string, data: any) {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteClient(id: string) {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function addPolicy(clientId: string, data: any) {
  // Not fully implemented in backend mock, assuming generic patch for now or we just skip error handling
  return { success: true }
}

export async function deletePolicy(id: string) {
  return { success: true }
}

export async function getFinancials() {
  const res = await fetch(`${API_URL}/financials`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function createExpense(data: { amount: number, description: string, date: string }) {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
