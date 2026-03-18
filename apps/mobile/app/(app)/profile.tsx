import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../../src/stores/use-auth-store'
import { logout as apiLogout } from '../../src/api/auth.api'
import { useTheme } from '../../src/theme'

export default function ProfileScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const user = useAuthStore((s) => s.user)
  const storeLogout = useAuthStore((s) => s.logout)

  async function handleLogout() {
    await apiLogout()
    await Promise.all([
      SecureStore.deleteItemAsync('refresh_token'),
      SecureStore.deleteItemAsync('auth_user'),
    ])
    storeLogout()
    router.replace('/(auth)/login')
  }

  if (!user) {
    Promise.all([
      SecureStore.deleteItemAsync('refresh_token'),
      SecureStore.deleteItemAsync('auth_user'),
    ]).then(() => {
      storeLogout()
      router.replace('/(auth)/login')
    })
    return null
  }

  return (
    <View style={styles.container}>
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitials}>
            {user.name.charAt(0)}{user.familyName.charAt(0)}
          </Text>
        </View>
      )}

      <Text style={styles.name}>{user.name} {user.familyName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginBottom: theme.spacing.sm,
    },
    avatarFallback: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatarInitials: {
      fontSize: theme.typography.size.xxl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.white,
    },
    name: {
      fontSize: theme.typography.size.xl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
    },
    email: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.navyMuted,
      marginBottom: theme.spacing.lg,
    },
    button: {
      backgroundColor: theme.colors.error,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      width: '100%',
      alignItems: 'center',
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.white,
    },
  })
}
