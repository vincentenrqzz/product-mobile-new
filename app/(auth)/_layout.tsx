import useAuthStore from '@/store/auth'
import { Redirect, Stack } from 'expo-router'
export default function AppLayout() {
  const { isLoggedIn } = useAuthStore()

  if (isLoggedIn) {
    return <Redirect href="/(main)/(tabs)/home" /> // Redirect to your authentication route
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  )
}
