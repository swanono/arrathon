import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { ThemeProvider } from '../src/theme'
import { useAuthStore } from '../src/stores/use-auth-store'
import { refreshToken } from '../src/api/auth.api'

export default function RootLayout() {
  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('refresh_token'),
      SecureStore.getItemAsync('auth_user'),
    ]).then(async ([token, userJson]) => {
      if (!token) return
      try {
        const { accessToken } = await refreshToken(token)
        const user = userJson ? JSON.parse(userJson) : null
        useAuthStore.getState().login(user, accessToken)
        router.replace('/(app)')
      } catch {
        await Promise.all([
          SecureStore.deleteItemAsync('refresh_token'),
          SecureStore.deleteItemAsync('auth_user'),
        ])
        router.replace('/(auth)/login')
      }
    })
  }, [])

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  )
}
