import useTaskStore, { PendingTask } from '@/store/tasks'
import * as FileSystem from 'expo-file-system'
import { Image } from 'react-native'

export const validateTaskImages = async (
  pendingTask: PendingTask,
): Promise<string[]> => {
  const validImages: string[] = []

  //saving of valid images
  for (const uri of pendingTask.images) {
    try {
      // 1. Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        console.warn(`Image does not exist: ${uri}`)
        continue
      }
      // console.log('fileInfo', fileInfo)
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

  // ✅ Update task's images in Zustand with only valid ones
  // update images of this specific task to have only valid images
  const store = useTaskStore.getState()
  const updatedTasks = store.pendingTasks.map((task) =>
    task.taskId === pendingTask.taskId
      ? { ...task, images: validImages }
      : task,
  )
  // console.log('updatedTasks', updatedTasks[0].images.length)
  useTaskStore.setState({ pendingTasks: updatedTasks })

  return validImages
}
