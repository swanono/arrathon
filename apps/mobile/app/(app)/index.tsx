import '../../src/styles/unistyles'
import { View, Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Arrathons</Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
}))
