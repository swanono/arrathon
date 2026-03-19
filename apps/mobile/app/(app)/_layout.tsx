import { useEffect } from 'react'
import { Tabs, router } from 'expo-router'
import { useTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/use-auth-store'

export default function AppLayout() {
  const theme = useTheme()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) {
      router.replace('/(auth)/login')
    }
  }, [accessToken])

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
      <Tabs.Screen name='create-arrathon' options={{ href: null }} />
    </Tabs>
  )
}
