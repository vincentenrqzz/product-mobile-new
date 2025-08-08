import * as BackgroundTask from 'expo-background-task' //background-fetch?
import * as TaskManager from 'expo-task-manager'
import { TASK_QUEUE_UPLOAD } from './backgroundQueueTask'

export const registerBackgroundQueueTask = async () => {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(TASK_QUEUE_UPLOAD)
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(TASK_QUEUE_UPLOAD, {
      minimumInterval: 15 * 60, // every 15 minutes
    })
    console.log('Background task registered.')
  } else {
    console.log('Background task already registered.')
  }
}
