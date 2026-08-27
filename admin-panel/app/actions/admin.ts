import { fetchApi } from '@/lib/api'

export async function getCompanyProfile() {
  const res = await fetchApi('/company', { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export async function updateCompanyProfile(data: any) {
  const res = await fetchApi('/company', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getLeads() {
  const res = await fetchApi('/leads', { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : (data.items ?? [])
}

export async function addManualClient(data: any) {
  const res = await fetchApi('/leads', {
    method: 'POST',
    body: JSON.stringify({ ...data, status: 'onaylandi' }),
  })
  return res.json()
}

export async function updateLeadFinancials(id: string, data: any) {
  const res = await fetchApi(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteLead(id: string) {
  const res = await fetchApi(`/leads/${id}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function restoreLead(id: string) {
  const res = await fetchApi(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'yeni' }),
  })
  return res.json()
}

export async function updateClientDetails(id: string, data: any) {
  const res = await fetchApi(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getNotifications(unreadOnly = false) {
  const res = await fetchApi(`/notifications?unreadOnly=${unreadOnly}`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

export async function markNotificationAsRead(id: string) {
  const res = await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' })
  return res.json()
}
