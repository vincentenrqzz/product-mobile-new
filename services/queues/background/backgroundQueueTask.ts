import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import { startQueueLoop } from '../startQueueLoop'

export const TASK_QUEUE_UPLOAD = 'task-queue-upload'

TaskManager.defineTask(TASK_QUEUE_UPLOAD, async () => {
  try {
    console.log('[BackgroundTask] Starting queue processing in background...')
    await startQueueLoop()

    return BackgroundTask.BackgroundTaskResult.Success
  } catch (e) {
    console.error('[BackgroundTask] Error in background:', e)
    return BackgroundTask.BackgroundTaskResult.Failed
  }
})
