import mime from 'mime'
import { uploadFile } from '../api/endpoints/upload'
import { getNextTask } from './getNextTask'
import { getConnectionState } from './networkWatcher'
import { validateTaskImages } from './validateTaskImages'

let isRunning = false

export const startQueueLoop = async () => {
  console.log('startQueueLoop')
  if (isRunning) return
  isRunning = true

  while (isRunning) {
    // first step queues
    // check connection if walay internet ang cp mo delay siya another 30 seconds
    // after 30 seconds check napod siya sa internet hangtud naa nay internet
    //  for exmaple mo start ang queus niya mawala kalit ang net
    const state = await getConnectionState()
    if (!state.isConnected) {
      console.log('Upload paused – offline')
      //   await showNotification('Upload paused – offline')
      await delay(30000)
      continue
    }
    // second step na nato
    // kuhaon niya ang first element sa pendingTask
    const next = getNextTask() //get first element sa pendingTask
    if (!next) {
      isRunning = false
      break
    }
    console.log('nextTaskId', next.taskId)
    // validate images
    const validImages = await validateTaskImages(next) // validate niya ang image sa anah na task
    console.log('valid', validImages.length)
    let retryCount = 2 //max 2
    if (validImages.length === 0) {
      continue
    }
    const batchPromises = validImages.map(async (filePath) => {
      console.log(filePath)
      const timestamp = Date.now()
      let extension = filePath.split('.').pop()?.toLowerCase() || '' // returns 'jpeg'
      const filename = filePath.split('/').pop() || ''

      //  create upload File
      const hasCorruptedChars =
        /[\?]+/.test(filename) || /[^\x00-\x7F]/.test(filePath)
      let sanitizedName
      if (hasCorruptedChars || filename.includes('?')) {
        sanitizedName = `document_${timestamp}${extension}`
      } else {
        sanitizedName = filePath
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/^\.+/, '')
      }

      const updatedName = sanitizedName || `file_${timestamp}${extension}`

      const fileName = `task/${next.taskId}/${filename}`

      const mimeType = mime.getType(filePath) || 'application/octet-stream'
      const fileData = {
        uri: filePath,
        type: mimeType,
        name: fileName,
      }
      const controller = new AbortController()
      const { signal } = controller
      let lastProgress = 0
      let lastProgressUpdate = Date.now()
      let fileStats: any = {}
      const uploadPromise = uploadFile(
        fileName,
        fileData,
        signal,
        (percent) => {
          lastProgress = percent
          lastProgressUpdate = Date.now()

          // if (!cancelRef.current && isUploadingRef.current) {
          //   updateProgress(
          //     next.taskId,
          //     taskUploadedCount,
          //     next?.images?.length,
          //     filename,
          //     percent,
          //     'uploading',
          //     failedFilesByTask[item.taskId],
          //   )
          // }
        },
      )

      // Create timeout promise
      const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(extension)
      const baseTimeout = isVideo ? 180000 : 90000
      const timeoutDuration = baseTimeout * (retryCount + 1)

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          controller.abort()

          const timeoutError = {
            code: 'ECONNABORTED',
            message: `Upload timed out after ${timeoutDuration}ms`,
            isTimeout: true,
            config: {
              timeout: timeoutDuration,
              url: 'uploadFileToService',
              method: 'POST',
              fileName,
            },
            details: {
              timeoutDuration,
              fileType: mimeType,
              isVideo,
              retryCount,
              lastProgress,
              timeSinceLastProgress: Date.now() - lastProgressUpdate,
              fileSize: fileStats.size || 0,
            },
          }

          reject(timeoutError)
        }, timeoutDuration)

        signal.addEventListener('abort', () => clearTimeout(timeoutId))
      })
      // Race between upload, timeout, and cancel
      const result: any = await Promise.race([uploadPromise, timeoutPromise])
      console.log('result', result)
    })

    // upload siya sa task details
    //end

    // try {
    //   const uploadResult = await uploadTaskImages(validImages)
    //   if (uploadResult.success) {
    //     removeAllSuccessImages(next.id)
    //   } else {
    //     // mark images failed
    //     // maybe partial success
    //     retry++
    //     removeAllSuccessImages(next.id)
    //     continue
    //   }
    //   retry = 0

    //   if (validImages.length === 0) {
    //     const uploadResult = await uploadTaskData(next)
    //     if (uploadResult.success) {
    //       continue
    //     } else {
    //       // mark images failed
    //       // maybe partial success
    //       retry++
    //       // removeAllSuccessImages(next.id)
    //       continue
    //     }
    //   }
    // } catch (e) {
    //   console.log('show error', e)
    //   // await showNotification('Upload failed. Will retry.')
    // }

    await delay(30000)
  }
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
