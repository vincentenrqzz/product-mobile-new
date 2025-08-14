import useTaskStore, { PendingImage } from '@/store/tasks'

export const removeFilesFromPendingImages = (invalidImages: PendingImage[]) => {
  const { pendingImages, setPendingImages } = useTaskStore.getState()
  const invalidPaths = invalidImages.map((img) => img.filePath)
  const validatedImage = pendingImages.filter(
    (img) => !invalidPaths.includes(img.filePath),
  )
  setPendingImages(validatedImage)
}
