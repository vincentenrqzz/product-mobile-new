import useTaskStore from '@/store/tasks'
// src/tasks/uploadPendingData.ts
import * as Network from 'expo-network'
import * as Notifications from 'expo-notifications'
import { showBackgroundNotification } from './backgroundNewsTask'

// Optional: Customize this notification
const sendOfflineNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upload paused',
      body: 'Cannot upload pending task – waiting for connection.',
    },
    trigger: null, // immediately
  })
}

// src/tasks/uploadPendingData.ts
export const uploadPendingTask = async () => {
  try {
    // ✅ 1. Check network status
    const network = await Network.getNetworkStateAsync()

    if (network.isConnected || !network.isInternetReachable) {
      console.log('No connection. Waiting to retry.')
      await sendOfflineNotification()
      await Notifications.dismissAllNotificationsAsync()

      showBackgroundNotification({ message: 'ASDASDSA' })
      return
    }
    // ✅ 2. Fetch pending data
    const { pendingTasks } = useTaskStore.getState()

    // ✅ 3. Upload loop
    for (const item of pendingTasks) {
      // Replace this with your actual upload logic
      //   await uploadToServer(item)
      console.log('uploading pending task...')
    }

    console.log('Background upload complete.')
  } catch (err) {
    console.error('Error uploading in background:', err)
  }
}
