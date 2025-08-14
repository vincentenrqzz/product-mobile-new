import { calculateBatchSize } from '@/lib/calculateBatchSize'
import { getBatchedImages } from '@/lib/getBatchImages'
import { NotificationService } from '@/services/notification'
import { PendingImage } from '@/store/tasks'
import { getPendingImageToProcess } from './getPendingImageToProcess'
import { removeFilesFromPendingImages } from './removeFilesFromPendingImages'
import { uploadImageWithRetry } from './uploadImageWithRetry'

export default async () => {
  const successImages: PendingImage[] = []

  const filteredImagesByTask = await getPendingImageToProcess()
  // If no valid images remain after filtering, return early
  if (Object.keys(filteredImagesByTask).length === 0) {
    return []
  }

  // get all images by batch
  const batchSize = await calculateBatchSize()
  const batch = await getBatchedImages(
    batchSize,
    0,
    Object.values(filteredImagesByTask).flat(),
  )

  // upload the  batch images
  const batchPromises = batch.map(async (item) => {
    const result = await uploadImageWithRetry(0, 0, item)
    console.log('result batchPromises', result)
    if (!result) {
      const errorMessage = result?.error || 'Upload failed'

      throw new Error(errorMessage)
    }
    if (result && !result?.error) {
      successImages.push(item)
      return item
    } else {
    }
  })

  const results = await Promise.all(
    batchPromises.map((p) =>
      p.catch((error) => {
        return null
      }),
    ),
  )

  //remove all succcess pending images
  const batchSuccesses = results.filter((r): r is PendingImage => r !== null)
  if (batchSuccesses.length > 0) {
    removeFilesFromPendingImages(successImages)
  }

  // check if batch images all failed
  const allFailed = results.every((result) => result === null)
  console.log('allFailed', allFailed)
  if (allFailed) {
    const message = {}
    await NotificationService.sendUploadFailedNotification()
  }
  return successImages
}
