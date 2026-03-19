import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../../src/stores/use-auth-store'
import { joinArrathon } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function JoinScreen() {
  const theme = useTheme()
  const { token } = useLocalSearchParams<{ token: string }>()
  const accessToken = useAuthStore((s) => s.accessToken)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    if (!accessToken) {
      SecureStore.setItemAsync('pending_join_token', token).then(() => {
        router.replace('/(auth)/login')
      })
      return
    }

    joinArrathon(token)
      .then(() => router.replace('/(app)'))
      .catch(() => setError('Lien d\'invitation invalide ou expiré'))
  }, [token, accessToken])

  const styles = makeStyles(theme)

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={theme.colors.primary} />
      <Text style={styles.label}>Rejoindre l'arrathon...</Text>
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      gap: theme.spacing.md,
    },
    label: {
      color: theme.colors.navyMuted,
      fontSize: theme.typography.size.md,
    },
    error: {
      color: theme.colors.error,
      fontSize: theme.typography.size.md,
      textAlign: 'center',
      padding: theme.spacing.xl,
    },
  })
}
