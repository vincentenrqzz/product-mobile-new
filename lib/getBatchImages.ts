import useTaskStore, { PendingImage } from '@/store/tasks'

export const getBatchedImages = async (
  batchSize: number,
  startIndex = 0,
  imagesToProcess?: PendingImage[],
) => {
  try {
    let imageArray: PendingImage[]

    if (imagesToProcess) {
      imageArray = imagesToProcess
    } else {
      const { pendingImages } = useTaskStore.getState()

      imageArray = pendingImages
    }

    const batch = imageArray.slice(startIndex, startIndex + batchSize)

    const processedBatch = await new Promise<PendingImage[]>(
      (resolve, reject) => {
        try {
          setImmediate(() => {
            resolve(batch)
          })
        } catch (error) {
          reject(error)
        }
      },
    )

    return processedBatch
  } catch (error) {
    return []
  }
}
