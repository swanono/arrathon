import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../src/theme'

export default function LoginScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arrathon</Text>
      <Text style={styles.subtitle}>Se connecter avec Google</Text>
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
    },
    title: {
      fontSize: theme.typography.size.xxl,
      fontWeight: theme.typography.weight.extraBold,
      color: theme.colors.navy,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.size.md,
      color: theme.colors.navyMuted,
    },
  })
}
