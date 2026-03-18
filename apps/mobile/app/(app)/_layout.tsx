import { Tabs } from 'expo-router'
import { useTheme } from '../../src/theme'

export default function AppLayout() {
  const theme = useTheme()

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
    >
      <Tabs.Screen name='index' options={{ title: 'Accueil' }} />
      <Tabs.Screen name='profile' options={{ title: 'Profil' }} />
    </Tabs>
  )
}
