import useTaskStore, { PendingImage } from '@/store/tasks'

export const removeFilesFrompendingTasks = (
  taskId: number,
  taskInvalidImages: PendingImage[],
) => {
  const invalidFileNames = taskInvalidImages.map((img) => img.name)

  const { pendingTasks, setPendingTasks } = useTaskStore.getState()

  const taskIndex = pendingTasks.findIndex(
    (pt: any) => pt.task.taskId === taskId,
  )
  if (taskIndex === -1) return

  const task = pendingTasks[taskIndex].task
  const cleanMissingFileNames = invalidFileNames.map(
    (name) => name.split('/').pop() || name,
  )
  let taskModified = false

  task.form.forEach((field: any) => {
    if (
      ['cameraButton', 'attachButton', 'signature'].includes(field.inputType)
    ) {
      if (Array.isArray(field.value)) {
        const originalLength = field.value.length
        field.value = field.value.filter((fileName: string) => {
          const cleanFieldFileName = fileName.split('/').pop() || fileName
          return !cleanMissingFileNames.includes(cleanFieldFileName)
        })

        if (field.value.length < originalLength) {
          taskModified = true
        }
      } else if (typeof field.value === 'string' && field.value) {
        const cleanFieldFileName = field.value.split('/').pop() || field.value
        if (cleanMissingFileNames.includes(cleanFieldFileName)) {
          field.value = ''
          taskModified = true
        }
      }
    }
  })
  if (taskModified) {
    setPendingTasks(pendingTasks)
  }
}
