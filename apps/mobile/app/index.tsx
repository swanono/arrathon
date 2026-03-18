import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/stores/use-auth-store'

export default function Index() {
  const accessToken = useAuthStore((s) => s.accessToken)

  return <Redirect href={accessToken ? '/(app)' : '/(auth)/login'} />
}
