import { PendingImage } from '@/store/tasks'
import * as FileSystem from 'expo-file-system'
import { isImageNameValid } from './isImageValid'

export const isImageValidAndExists = async (
  image: PendingImage,
  validNames: Set<string>,
): Promise<boolean> => {
  // First check if the name is valid
  if (!isImageNameValid(image.name, validNames)) {
    return false
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(image.filePath)
    if (!fileInfo.exists) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
