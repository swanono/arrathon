import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { ThemeProvider } from '../src/theme'
import { useAuthStore } from '../src/stores/use-auth-store'
import { refreshToken } from '../src/api/auth.api'

export default function RootLayout() {
  useEffect(() => {
    SecureStore.getItemAsync('refresh_token').then(async (token) => {
      if (!token) return
      try {
        const { accessToken } = await refreshToken(token)
        useAuthStore.getState().setAccessToken(accessToken)
        router.replace('/(app)')
      } catch {
        await SecureStore.deleteItemAsync('refresh_token')
      }
    })
  }, [])

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  )
}
