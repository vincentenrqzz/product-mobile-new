import useTaskStore from '@/store/tasks'
import { NotificationService } from '../notification'
import { getNextTask } from './getNextTask'
import { getConnectionState } from './networkWatcher'
import sendPendingImages from './sendPendingImages'
import sendPendingTasks from './sendPendingTasks'

let isRunning = false

let abortController: AbortController | null = null

// Cancellable delay: resolves after ms, or rejects immediately if aborted
const abortableDelay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      cleanup()
      reject(new Error('aborted'))
    }

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort)
    }

    if (signal?.aborted) {
      onAbort()
      return
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })

export const startQueueLoop = async () => {
  console.log('startQueueLoop', isRunning)
  if (isRunning) return

  isRunning = true

  while (isRunning) {
    const state = await getConnectionState()
    if (!state.isConnected) {
      console.log('Upload paused – offline')
      try {
        // await abortableDelay(delayedms, abortController?.signal) // ← abortable
        stopQueueLoop()
      } catch (e: any) {
        if (e?.message === 'aborted') break
        throw e
      }
      continue
    }
    console.log('Queueing')

    const next = getNextTask()
    if (!next) {
      // isRunning = false
      NotificationService.sendCompletedUploadPendingTaskNotification()
      stopQueueLoop()
      break
    }
    await NotificationService.dismissAllNotification()
    NotificationService.showBackgroundNotification()
    const updatedImages = await sendPendingImages()
    const { pendingImages, pendingTasks } = useTaskStore.getState()
    console.log('updatedImages', updatedImages.length)
    console.log('pendingImages', pendingImages.length)

    // if (updatedImages.length > 0) {
    //  if (isMountedRef.current && !cancelRef.current) { ask this
    //     await syncProgressWithPendingImages();
    //   }
    // }
    const updatedTasks = await sendPendingTasks()
    console.log('pendingTasks', pendingTasks.length)
    console.log('updatedTasks', updatedTasks)

    if (!getNextTask()) {
      // isRunning = false
      await NotificationService.dismissAllNotification()
      NotificationService.sendCompletedUploadPendingTaskNotification()
      stopQueueLoop()
      break
    }
    try {
      await abortableDelay(delayedms, abortController?.signal) // ← abortable
    } catch (e: any) {
      if (e?.message === 'aborted') break
      throw e
    }
    await delay(delayedms)
  }
}

export const stopQueueLoop = () => {
  console.log('stopQueueLoop')
  if (!isRunning) return
  isRunning = false
  abortController?.abort() // ← interrupts any pending delay immediately
  abortController = null
}

const delayedms = 30000
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
