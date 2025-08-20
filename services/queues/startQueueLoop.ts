// queue/startQueueLoop.ts
import { useQueueStore } from '@/store/queue'
import useUploadStore from '@/store/upload'
import { NotificationService } from '../notification'
import { getNextTask } from './getNextTask'
import { getConnectionState } from './networkWatcher'
import sendPendingImages from './sendPendingImages'
import sendPendingTasks from './sendPendingTasks'

const DELAY_MS = 30000

const abortableDelay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(t)
      cleanup()
      reject(new Error('aborted'))
    }
    const cleanup = () => signal?.removeEventListener('abort', onAbort)
    if (signal?.aborted) return onAbort()
    signal?.addEventListener('abort', onAbort, { once: true })
  })

export const startQueueLoop = async () => {
  const { isRunning, startRun, stopRun, setIsRunning } =
    useQueueStore.getState()

  if (isRunning) {
    console.log('startQueueLoop: already running')
    return
  }

  console.log('startQueueLoop: starting')
  const controller = startRun()
  const { signal } = controller
  useUploadStore.getState().setCancelAllUpload(false)

  try {
    while (!signal.aborted) {
      const state = await getConnectionState()
      console.log('state', state)
      if (!state.isConnected) {
        console.log('Upload paused – offline')
        try {
          await abortableDelay(DELAY_MS, signal)
        } catch (e: any) {
          if (e?.message === 'aborted') break
          throw e
        }
        continue
      }

      console.log('Queueing')
      const next = getNextTask()
      if (!next) {
        await NotificationService.dismissAllNotification()
        NotificationService.sendCompletedUploadPendingTaskNotification()
        break
      }

      await NotificationService.dismissAllNotification()
      NotificationService.showBackgroundNotification()

      const updatedImages = await sendPendingImages()
      const updatedTasks = await sendPendingTasks()
      console.log('updatedImages', updatedImages.length)
      console.log('updatedTasks', updatedTasks)

      if (!getNextTask()) {
        await NotificationService.dismissAllNotification()
        NotificationService.sendCompletedUploadPendingTaskNotification()
        break
      }

      try {
        await abortableDelay(DELAY_MS, signal)
      } catch (e: any) {
        if (e?.message === 'aborted') {
          console.log('Queue loop aborted by stopQueueLoop()')
          break
        }
        throw e
      }
    }
  } finally {
    console.log('startQueueLoop: stopping / cleanup')
    stopRun()
    await NotificationService.dismissAllNotification()
  }
}

export const stopQueueLoop = () => {
  const { stopRun, setIsRunning } = useQueueStore.getState()
  // Keep using your existing global cancel flag if you like
  useUploadStore.getState().setCancelAllUpload(true)
  console.log('stopQueueLoop: aborting current run')
  stopRun()
}
