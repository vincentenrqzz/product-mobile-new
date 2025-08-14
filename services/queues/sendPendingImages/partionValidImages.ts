import { PendingImage } from '@/store/tasks'
import { isImageValidAndExists } from './isImageValidAndExists'

type ValidationResult = {
  validImages: PendingImage[]
  invalidImages: PendingImage[]
}

export async function partitionValidImages(
  taskImages: PendingImage[],
  validImageNames: Set<string>,
): Promise<ValidationResult> {
  // Build results without throwing (errors => invalid)
  const results = await Promise.all(
    taskImages.map(async (img) => {
      try {
        const isValid = await isImageValidAndExists(img, validImageNames)
        return { img, isValid }
      } catch {
        return { img, isValid: false }
      }
    }),
  )

  const validImages = results.filter((r) => r.isValid).map((r) => r.img)
  const invalidImages = results.filter((r) => !r.isValid).map((r) => r.img)

  return { validImages, invalidImages }
}
