import { apiFetch } from './client'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  })

  if (!res.ok) throw new Error('Refresh failed')

  const json = await res.json() as { data: { accessToken: string } }
  return { accessToken: json.data.accessToken }
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' }).catch(() => null)
}
