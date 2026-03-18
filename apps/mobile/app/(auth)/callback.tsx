import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore, type AuthUser } from '../../src/stores/use-auth-store'
import { useTheme } from '../../src/theme'

export default function AuthCallback() {
  const theme = useTheme()
  const params = useLocalSearchParams<{
    accessToken: string
    refreshToken: string
    userId: string
    name: string
    familyName: string
    email: string
    avatarUrl?: string
  }>()

  useEffect(() => {
    const { accessToken, refreshToken, userId, name, familyName, email, avatarUrl } = params

    if (!accessToken || !refreshToken || !userId) {
      router.replace('/(auth)/login')
      return
    }

    const user: AuthUser = {
      id: userId,
      name,
      familyName,
      email,
      avatarUrl: avatarUrl ?? null,
    }

    SecureStore.setItemAsync('refresh_token', refreshToken)
      .then(() => {
        useAuthStore.getState().login(user, accessToken)
        router.replace('/(app)')
      })
      .catch(() => router.replace('/(auth)/login'))
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={theme.colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
