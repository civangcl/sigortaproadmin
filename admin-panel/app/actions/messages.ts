const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function getMessages(token: string) {
  const res = await fetch(`${API_URL}/messages`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function updateMessageStatus(id: string, status: 'okundu' | 'yeni') {
  const res = await fetch(`${API_URL}/messages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export async function submitContactForm(data: any) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
