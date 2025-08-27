import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export class NotificationService {
  // Keep the latest notification id per task so we can dismiss/replace it
  private static taskToNotifId = new Map<number, string>()

  // Build a stable channel id per task (Android only)
  private static channelForTask(taskId: number) {
    return `task-${taskId}`
  }

  // Ensure the channel exists before posting (Android 8+ requirement)
  private static async ensureTaskChannel(taskId: number) {
    if (Platform.OS !== 'android') return
    const channelId = this.channelForTask(taskId)
    await Notifications.setNotificationChannelAsync(channelId, {
      name: `Task ${taskId}`,
      importance: Notifications.AndroidImportance.HIGH,
      // optional extras:
      // vibrationPattern: [0, 250, 250, 250],
      // lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      // sound: undefined,
    })
  }

  // Dismiss/cancel any existing notification for this task
  static async dismissByTask(taskId: number) {
    const prevId = this.taskToNotifId.get(taskId)
    if (prevId) {
      try {
        await Notifications.dismissNotificationAsync(prevId)
      } catch {}
      try {
        await Notifications.cancelScheduledNotificationAsync(prevId)
      } catch {}
      this.taskToNotifId.delete(taskId)
      return
    }
    // Fallback: scan presented notifications (if we didn't store the id)
    try {
      const presented = await Notifications.getPresentedNotificationsAsync()
      const channelId = this.channelForTask(taskId)
      for (const n of presented) {
        const id = n.request.identifier
        const dataTaskId = (n.request.content?.data as any)?.taskId
        const trig: any = n.request.trigger
        const notifChannel =
          trig?.channelId ??
          trig?.value?.channelId ?? // some triggers are nested
          undefined
        if (dataTaskId === taskId || notifChannel === channelId) {
          await Notifications.dismissNotificationAsync(id)
        }
      }
    } catch {}
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────────

  // Notify when uploads are paused due to no connection (global, not per task)
  static async sendOfflineNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upload Paused',
        body: 'Pending tasks are paused until an internet connection is available.',
      },
      trigger: null,
    })
  }

  // Background "in-progress" for a specific task (sticky/ongoing)
  static async showBackgroundNotificationByTask({
    taskId,
  }: {
    taskId: number
  }) {
    await this.ensureTaskChannel(taskId)
    await this.dismissByTask(taskId)

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Task ID ${taskId} uploading`,
        body: 'Your pending tasks are currently being uploaded in the background.',
        data: { taskId },
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: this.channelForTask(taskId) }
          : null,
    })
    // console.log('TRIGGER BACKGROUDNOTIF', id)
    this.taskToNotifId.set(taskId, id)
    return id
  }

  // Completed upload (per task) — replace any existing notif for that task
  static async sendCompletedUploadPendingTaskNotification({
    taskId,
  }: {
    taskId: number
  }) {
    await this.ensureTaskChannel(taskId)
    await this.dismissByTask(taskId)

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Task ID ${taskId} Upload Complete`,
        body: `Task ID ${taskId} have been uploaded successfully.`,
        data: { taskId },
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: this.channelForTask(taskId) }
          : null,
    })

    this.taskToNotifId.set(taskId, id)
    return id
  }

  // Failed upload (per task) — replace any existing notif for that task
  static async sendUploadFailedNotification({
    taskId,
    desc,
  }: {
    taskId: number
    desc?: string
  }) {
    await this.ensureTaskChannel(taskId)
    await this.dismissByTask(taskId)

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Task ID ${taskId} upload Failed`,
        body:
          desc ||
          'tasks could not be uploaded. Please check your connection or try again.',
        data: { taskId },
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: this.channelForTask(taskId) }
          : null,
    })

    this.taskToNotifId.set(taskId, id)
    return id
  }

  // Background "in-progress" (generic, not tied to a task)
  static async showBackgroundNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Uploading Pending Tasks',
        body: 'Your pending tasks are currently being uploaded in the background.',
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sound: undefined,
      },
      trigger: null,
    })
  }

  // Dismiss all delivered and cancel all scheduled notifications
  static async dismissAllNotification() {
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.cancelAllScheduledNotificationsAsync()
    this.taskToNotifId.clear()
  }
}
