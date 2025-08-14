import { calculateBatchSize } from '@/lib/calculateBatchSize'
import { changeTaskStatus } from '@/services/api/endpoints/tasks'
import { NotificationService } from '@/services/notification'
import useTaskStore from '@/store/tasks'
import { getConnectionState } from '../networkWatcher'

export default async () => {
  const { pendingTasks, setPendingTasks, pendingImages, taskTypes } =
    useTaskStore.getState()
  const successTaskIds: number[] = []
  const failedTaskIds: number[] = []
  if (!pendingTasks.length) {
    return []
  }

  const batchSize = await calculateBatchSize()

  for (let i = 0; i < pendingTasks.length; i += batchSize) {
    // checking internet connection
    const state = await getConnectionState()
    if (!state.isConnected) {
      // for (let j = i; j < pendingTasks.length; j++) {}
      NotificationService.sendOfflineNotification()
    }

    //uploading tasks
    const batch = pendingTasks.slice(i, i + batchSize)
    const batchPromises = batch.map(async (pendingTask) => {
      const { task, newStatus } = pendingTask

      if (newStatus === 'done') {
        const hasRemainingImages = pendingImages.some(
          (img) => img.taskId === task.taskId,
        )
        if (hasRemainingImages) {
          return {
            success: false,
            taskId: task.taskId,
            reason: 'pending_images',
          }
        }
      }

      task.statusId = newStatus

      try {
        const controller = new AbortController()
        const { signal } = controller

        const timeout = new Promise((_, reject) =>
          setTimeout(() => {
            controller.abort()
            reject(new Error('Task update timed out'))
          }, 60000),
        )
        const send = changeTaskStatus(task._id, task, taskTypes, signal)

        const cancelRef = false
        const checker = new Promise<never>((_, reject) => {
          const intervalId = setInterval(() => {
            if (cancelRef) {
              clearInterval(intervalId)
              controller.abort()

              reject(new Error('Task update cancelled or connection lost'))
            }
          }, 100)
        })

        const response: any = await Promise.race([timeout, send, checker])
        console.log('updating task', response?.data)
        if (response?.data) {
          return { success: true, taskId: task.taskId }
        }
        NotificationService.sendUploadFailedNotification()
        return {
          success: false,
          taskId: task.taskId,
          reason: 'invalid_response',
        }
      } catch (error: any) {
        console.log('Error', error)
        NotificationService.sendUploadFailedNotification()
        return { success: false, taskId: task.taskId, reason: error.message }
      }
    })
    const results = await Promise.all(batchPromises)

    // Process results
    results.forEach((result) => {
      console.log('results', results)
      if (result.success) {
        successTaskIds.push(result.taskId)
      } else {
        failedTaskIds.push(result.taskId)
      }
    })
  }
  // Update pending tasks in storage
  const remainingPendingTasks = pendingTasks.filter(
    (item) => !successTaskIds.includes(item.task.taskId),
  )
  console.log('remainingPendingTasks', remainingPendingTasks)
  console.log('successTaskIds', successTaskIds)

  setPendingTasks(remainingPendingTasks)
  return successTaskIds
}
