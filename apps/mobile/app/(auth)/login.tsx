import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useState } from 'react'
import { useTheme } from '../../src/theme'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      const redirectUrl = Linking.createURL('/callback')
      const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/google?platform=mobile`
      await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arrathon</Text>
      <Text style={styles.subtitle}>Votre aventure collective</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.buttonText}>Se connecter avec Google</Text>
        )}
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
      gap: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.size.xxl,
      fontWeight: theme.typography.weight.extraBold,
      color: theme.colors.navy,
    },
    subtitle: {
      fontSize: theme.typography.size.md,
      color: theme.colors.navyMuted,
      marginBottom: theme.spacing.xl,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      width: '100%',
      alignItems: 'center',
      ...theme.shadows.btn3dPrimary,
    },
    buttonPressed: {
      transform: [{ translateY: 2 }],
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    buttonText: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.white,
    },
  })
}
