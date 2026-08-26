import { fetchApi } from '@/lib/api'

export async function getClients() {
  const res = await fetchApi('/clients', { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : (data.items ?? [])
}

export async function createClient(data: any) {
  const res = await fetchApi('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateClient(id: string, data: any) {
  const res = await fetchApi(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteClient(id: string) {
  const res = await fetchApi(`/clients/${id}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function addPolicy(clientId: string, data: any) {
  const res = await fetchApi('/policies', {
    method: 'POST',
    body: JSON.stringify({ ...data, clientId }),
  })
  if (!res.ok) return { success: false, error: 'Poliçe kaydedilemedi.' }
  const policy = await res.json()
  return { success: true, policy }
}

export async function deletePolicy(id: string) {
  const res = await fetchApi(`/policies/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) return { success: false, error: 'Poliçe silinemedi.' }
  return { success: true }
}

export async function getFinancials() {
  const res = await fetchApi('/financials', { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : (data.items ?? [])
}

export async function createExpense(data: { amount: number, description: string, date: string }) {
  const res = await fetchApi('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}
