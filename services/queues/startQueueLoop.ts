import { getConnectionState } from './networkWatcher'

let isRunning = false

export const startQueueLoop = async () => {
  console.log('startQueueLoop')
  if (isRunning) return
  isRunning = true

  while (isRunning) {
    const state = await getConnectionState()
    if (!state.isConnected) {
      console.log('Upload paused – offline')
      //   await showNotification('Upload paused – offline')
      await delay(30000)
      continue
    }

    const next = getNextTask() //get first element sa pendingTask
    if (!next) {
      isRunning = false
      break
    }

    const valid = await validateTaskImages(next) // validate niya ang image sa anah na task
    let validImages = []
    let retry = 2 //max 2
    if (!valid) {
      validImages = removeInvalidImage(next.id)
      // continue
    }

    try {
      const uploadResult = await uploadTaskImages(validImages)
      if (uploadResult.success) {
        removeAllSuccessImages(next.id)
      } else {
        // mark images failed
        // maybe partial success
        retry++
        removeAllSuccessImages(next.id)
        continue
      }
      retry = 0

      if (validImages.length === 0) {
        const uploadResult = await uploadTaskData(next)
        if (uploadResult.success) {
          continue
        } else {
          // mark images failed
          // maybe partial success
          retry++
          // removeAllSuccessImages(next.id)
          continue
        }
      }
    } catch (e) {
      await showNotification('Upload failed. Will retry.')
    }

    await delay(30000)
  }
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
