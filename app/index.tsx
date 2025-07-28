import useAuthStore from '@/store/auth'
import { Redirect } from 'expo-router'

export default function Index() {
  const { isLoggedIn } = useAuthStore()

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // Redirect based on auth state
  if (isLoggedIn) {
    return <Redirect href="/(main)/(tabs)/home" />
  } else {
    return <Redirect href="/(auth)/login" />
  }
}
