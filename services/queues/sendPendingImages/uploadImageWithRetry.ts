import { PendingImage } from '@/store/tasks'
import mime from 'mime'
import { uploadFile } from '../../api/endpoints/upload'

export const uploadImageWithRetry = async (
  retryCount = 0,
  maxRetries = 0,
  item: PendingImage,
): Promise<any | null> => {
  try {
    const filePath = item.filePath.startsWith('file://')
      ? item.filePath
      : `file://${item.filePath}`
    const rawPath = filePath.replace('file://', '')

    const ext: any = item.filePath.split('.').pop()?.toLowerCase()
    const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(ext)
    const mimeType = mime.getType(ext) || 'application/octet-stream'

    // Adaptive timeout based on file type and retry count
    const baseTimeout = isVideo ? 180000 : 90000 // 3 min for video, 1.5 min for images
    const timeoutDuration = baseTimeout * (retryCount + 1) // Increase timeout on retries

    const controller = new AbortController()
    const { signal } = controller

    const cancel = false
    // Create a promise that resolves when cancelled
    const cancelPromise = new Promise<never>((_, reject) => {
      const checkCancel = () => {
        if (cancel) {
          controller.abort()
          reject(new Error('Upload cancelled or connection lost'))
        }
      }

      checkCancel()

      const intervalId = setInterval(checkCancel, 500)

      signal.addEventListener('abort', () => clearInterval(intervalId))
    })

    const fileData = {
      uri: filePath,
      type: mimeType,
      name: item.name,
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        controller.abort()
        const timeoutError = new Error(
          `Upload timed out after ${timeoutDuration}ms`,
        )
        reject(timeoutError)
      }, timeoutDuration)

      signal.addEventListener('abort', () => clearTimeout(timeoutId))
    })

    // log(`sendImagePending: Starting upload for ${item.name}`);

    // Upload promise
    const uploadPromise = uploadFile(item.name, fileData, signal, (percent) => {
      //   lastProgress = percent
      //   lastProgressUpdate = Date.now()
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
    })

    // Race between upload, timeout, and cancel
    const result: any = await Promise.race([
      uploadPromise,
      timeoutPromise,
      cancelPromise,
    ])

    console.log('result uploadImagewithretryo')
    if (result && !result?.error) {
      return item
    } else {
      const errorMessage = result?.error || 'Upload failed'

      throw new Error(errorMessage)
    }
  } catch (err: any) {
    console.log('err', err)
    const isNetworkError =
      err.message.includes('Network Error') ||
      err.message.includes('connection lost') ||
      err.code === 'ERR_NETWORK'

    if (isNetworkError) {
      return null
    }

    return null
  }
}
