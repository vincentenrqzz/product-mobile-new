import * as FileSystem from 'expo-file-system'
import { Image } from 'react-native'

export const validateTaskImages = async (
  imageUris: string[],
): Promise<string[]> => {
  const validImages: string[] = []

  for (const uri of imageUris) {
    try {
      // 1. Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        console.warn(`Image does not exist: ${uri}`)
        continue
      }

      // 2. Try to load image dimensions (checks if it's a valid image)
      await new Promise<void>((resolve, reject) => {
        Image.getSize(
          uri,
          () => resolve(), // valid image
          (error) => reject(error), // invalid image
        )
      })

      // 3. If all checks pass
      validImages.push(uri)
    } catch (error) {
      console.warn(`Invalid image: ${uri}`, error)
    }
  }

  return validImages
}
