import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { HelloWave } from '@/components/HelloWave'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import AppLogo from '@/components/ui/AppLogo'
import { pendingImages, pendingTasks } from '@/lib/constants'
import { stopQueueLoop } from '@/services/queues/startQueueLoop'
import useAuthStore from '@/store/auth'
import useTaskStore from '@/store/tasks'

export default function Settings() {
  const { logout } = useAuthStore()
  const { setPendingImages, setPendingTasks } = useTaskStore()
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerContent={<AppLogo />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
        <HelloWave />
      </ThemedView>
      <TouchableOpacity
        style={[styles.button]}
        onPress={async () => {
          stopQueueLoop() // ← instantly cancels any pending delay
          useAuthStore.getState().logout()
          console.log('Logging out')
        }}
      >
        {/* {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Logout</Text>
        )} */}
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button]}
        onPress={async () => {
          setPendingImages(pendingImages)
          setPendingTasks(pendingTasks)
        }}
      >
        {/* {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Logout</Text>
        )} */}
        <Text style={styles.buttonText}>Submit Task</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
