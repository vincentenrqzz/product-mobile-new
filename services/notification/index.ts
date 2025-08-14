import * as Notifications from 'expo-notifications'

export class NotificationService {
  // Notify when uploads are paused due to no connection
  static async sendOfflineNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upload Paused',
        body: 'Pending tasks are paused until an internet connection is available.',
      },
      trigger: null,
    })
  }

  // Notify when all pending tasks have been uploaded successfully
  static async sendCompletedUploadPendingTaskNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upload Complete',
        body: 'All pending tasks have been uploaded successfully.',
      },
      trigger: null,
    })
  }

  // Notify when uploads have failed
  static async sendUploadFailedNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upload Failed',
        body: 'Some pending tasks could not be uploaded. Please check your connection or try again.',
      },
      trigger: null,
    })
  }

  // Show a background "in-progress" upload notification
  static async showBackgroundNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Uploading Pending Tasks',
        body: 'Your pending tasks are currently being uploaded in the background.',
        sticky: true, // Android ongoing notification
        sound: undefined,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        autoDismiss: false,
      },
      trigger: null,
    })
  }

  // Dismiss all delivered and cancel all scheduled notifications
  static async dismissAllNotification() {
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.cancelAllScheduledNotificationsAsync()
  }
}
