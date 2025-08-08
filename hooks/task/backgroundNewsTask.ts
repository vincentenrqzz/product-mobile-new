// src/tasks/backgroundNewsTask.ts

import * as BackgroundTask from 'expo-background-task'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import { uploadPendingTask } from './uploadingPendingTask'

export const NEWS_TASK = 'background-fetch-news'

export const showBackgroundNotification = async (news: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Uploading tasks...',
      body: news.message || 'News data uploaded in background',
      sticky: true, // stays until cleared
      sound: undefined,
    },
    trigger: null,
  })
}

// ✅ Global task definition — MUST be outside any hook or function
TaskManager.defineTask(NEWS_TASK, async () => {
  console.log('[Background Task] Triggered') // Add this

  try {
    // Replace this with your actual data fetching logic
    const news = { message: 'Fetched news data.' }
    // await showBackgroundNotification(news)

    // // Simulate storing or processing the data
    // // await storeNews(news)
    uploadPendingTask()
    return BackgroundTask.BackgroundTaskResult.Success
  } catch (err) {
    console.error('Background task failed', err)
    return BackgroundTask.BackgroundTaskResult.Failed
  }
})

// ✅ Background task registration
export const registerNewsBackgroundTask = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(NEWS_TASK)
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(NEWS_TASK, {
      minimumInterval: 15 * 60, // every 15 minutes
    })
    console.log('Background task registered.')
  } else {
    console.log('Background task already registered.')
  }
}
