import { fetchApi } from '@/lib/api'

export async function getMessages(token: string) {
  const res = await fetchApi('/messages', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function updateMessageStatus(id: string, status: 'okundu' | 'yeni') {
  const res = await fetchApi(`/messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export async function submitContactForm(data: any) {
  const res = await fetchApi('/messages', {
    method: 'POST',
    body: JSON.stringify({
      fullName: data.name,
      phoneNumber: data.phone,
      email: data.email,
      subject: data.subject,
      content: data.message,
    }),
  })
  return res.json()
}
