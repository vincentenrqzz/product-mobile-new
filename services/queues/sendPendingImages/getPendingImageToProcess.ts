import useTaskStore, { PendingImage } from '@/store/tasks'
import { getValidImageNamesFromTask } from './getValidImageNamesFromTask'
import { partitionValidImages } from './partionValidImages'
import { removeFilesFromPendingImages } from './removeFilesFromPendingImages'
import { removeFilesFrompendingTasks } from './removeFilesFromPendingTasks'

export const getPendingImageToProcess = async () => {
  const { pendingImages, pendingTasks } = useTaskStore.getState()
  const taskMap = new Map<number, any>()
  const filteredImagesByTask: Record<number, PendingImage[]> = {}

  pendingTasks.forEach((pending) => {
    if (pending.task) {
      taskMap.set(pending.task.taskId, pending.task)
    }
  })

  // Pre-validate all images and remove missing files from tasks BEFORE building upload queue
  const imagesByTaskOriginal = pendingImages.reduce(
    (acc: Record<number, PendingImage[]>, img: PendingImage) => {
      if (!acc[img.taskId]) {
        acc[img.taskId] = []
      }
      acc[img.taskId].push(img)
      return acc
    },
    {},
  )
  //loop trough pendingimages
  for (const [taskId, taskImages] of Object.entries(imagesByTaskOriginal)) {
    //  continue if no found task via taskIdImages
    const task = taskMap.get(parseInt(taskId))
    if (!task) {
      continue
    }

    // get all unique images from task 'cameraButton', 'signature', 'attachButton'
    const validImageNames = getValidImageNamesFromTask(task)
    // partion the valid images
    const { validImages: taskValidImages, invalidImages: taskInvalidImages } =
      await partitionValidImages(taskImages, validImageNames)
    if (taskValidImages.length > 0) {
      filteredImagesByTask[parseInt(taskId)] = taskValidImages
    }
    if (taskInvalidImages.length > 0) {
      removeFilesFromPendingImages(taskInvalidImages)
      removeFilesFrompendingTasks(parseInt(taskId), taskInvalidImages)
    }
  }
  return filteredImagesByTask
}
