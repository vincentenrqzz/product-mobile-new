import useAuthStore from '@/store/auth'
import { Redirect, Stack } from 'expo-router'
export default function AppLayout() {
  const { isLoggedIn } = useAuthStore()

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" /> // Redirect to your authentication route
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
