import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../src/theme'

export default function HomeScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Arrathons</Text>
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.size.xl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
    },
  })
}
