import { apiFetch } from './client'

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const res = await apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  })

  if (!res.ok) throw new Error('Refresh failed')

  const json = await res.json() as { data: { accessToken: string } }
  return { accessToken: json.data.accessToken }
}
