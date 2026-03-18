import { Tabs } from 'expo-router'
import { useStyles } from 'react-native-unistyles'

export default function AppLayout() {
  const { theme } = useStyles()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.navyMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
      }}
    />
  )
}
