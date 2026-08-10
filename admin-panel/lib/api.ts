import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers || {})
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  // Set default content type for JSON if not explicitly passed
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  let baseUrl = API_URL
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
  
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = `${baseUrl}${formattedEndpoint}`

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  })

  return res
}
