const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function getCompanyProfile() {
  const res = await fetch(`${API_URL}/company`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export async function updateCompanyProfile(data: any) {
  const res = await fetch(`${API_URL}/company`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getLeads() {
  const res = await fetch(`${API_URL}/leads`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function addManualClient(data: any) {
  const res = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, status: 'onaylandi' }),
  })
  return res.json()
}

export async function updateLeadFinancials(id: string, data: any) {
  const res = await fetch(`${API_URL}/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteLead(id: string) {
  const res = await fetch(`${API_URL}/leads/${id}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function restoreLead(id: string) {
  const res = await fetch(`${API_URL}/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'yeni' }),
  })
  return res.json()
}

export async function updateClientDetails(id: string, data: any) {
  // Update via leads patch or clients patch
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
