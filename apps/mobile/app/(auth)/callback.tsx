import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore, type AuthUser } from '../../src/stores/use-auth-store'
import { joinArrathon } from '../../src/api/arrathon.api'
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

    Promise.all([
      SecureStore.setItemAsync('refresh_token', refreshToken),
      SecureStore.setItemAsync('auth_user', JSON.stringify(user)),
    ])
      .then(async () => {
        useAuthStore.getState().login(user, accessToken)
        const pendingToken = await SecureStore.getItemAsync('pending_join_token')
        if (pendingToken) {
          await joinArrathon(pendingToken).catch(() => null)
          await SecureStore.deleteItemAsync('pending_join_token')
        }
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
