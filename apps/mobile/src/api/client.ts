import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { useAuthStore } from '../stores/use-auth-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

function buildHeaders(token?: string | null, extra?: HeadersInit): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra as Record<string, string> ?? {}),
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = useAuthStore.getState().accessToken
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: buildHeaders(token, init?.headers) })

  if (res.status !== 401) return res

  try {
    const stored = await SecureStore.getItemAsync('refresh_token')
    if (!stored) throw new Error('no token')

    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: stored }),
    })
    if (!refreshRes.ok) throw new Error('refresh failed')

    const json = await refreshRes.json() as { data: { accessToken: string } }
    const newToken = json.data.accessToken
    useAuthStore.getState().setAccessToken(newToken)

    return fetch(`${BASE_URL}${path}`, { ...init, headers: buildHeaders(newToken, init?.headers) })
  } catch {
    await Promise.all([
      SecureStore.deleteItemAsync('refresh_token'),
      SecureStore.deleteItemAsync('auth_user'),
    ])
    useAuthStore.getState().logout()
    router.replace('/(auth)/login')
    return res
  }
}
