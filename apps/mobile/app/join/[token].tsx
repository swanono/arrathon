import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { toast } from 'sonner-native'
import { useAuthStore } from '../../src/stores/use-auth-store'
import { joinArrathon } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function JoinScreen() {
  const theme = useTheme()
  const { token } = useLocalSearchParams<{ token: string }>()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!token) return

    if (!accessToken) {
      SecureStore.setItemAsync('pending_join_token', token).then(() => {
        router.replace('/(auth)/login')
      })
      return
    }

    joinArrathon(token)
      .then(({ alreadyMember, arrathon }) => {
        if (alreadyMember) {
          toast.warning('Vous êtes déjà membre de cet arrathon')
        } else {
          toast.success(`Vous avez rejoint "${arrathon.name}" !`)
        }
        router.replace('/(app)')
      })
      .catch(() => {
        toast.error('Lien d\'invitation invalide ou expiré')
        router.replace('/(app)')
      })
  }, [token, accessToken])

  return (
    <View style={makeStyles(theme).container}>
      <ActivityIndicator size='large' color={theme.colors.primary} />
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
