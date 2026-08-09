const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function submitQuote(data: any) {
  const res = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      policyType: data.insuranceType,
      name: data.fullName,
      tc: data.tcKimlikNo,
      phone: data.phoneNumber,
      email: data.email,
      city: data.city,
      plate: data.licensePlate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      premium: 0,
      commission: 0,
      status: 'yeni',
    }),
  })
  return res.json()
}
