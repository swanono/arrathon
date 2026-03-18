import '../../src/styles/unistyles'
import { View, Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arrathon</Text>
      <Text style={styles.subtitle}>Se connecter avec Google</Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.xxl,
    fontWeight: theme.typography.weightExtraBold,
    color: theme.colors.navy,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.md,
    color: theme.colors.navyMuted,
  },
}))
