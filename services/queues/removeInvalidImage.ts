import useTaskStore from '@/store/tasks'

export const removeInvalidImage = (taskId: string) => {
  const pendingTasks = useTaskStore.getState().pendingTasks
  const task = pendingTasks.find((t) => t.taskId === taskId)
  if (!task) return []

  // Validate and remove images
  const validImages = task.images.filter((img: string) => !!img) // Simulate removal (replace with your logic)

  // Update task
  const updatedTask = { ...task, images: validImages }
  const updatedPending = pendingTasks.map((t) =>
    t.taskId === taskId ? updatedTask : t,
  )

  useTaskStore.setState({ pendingTasks: updatedPending })

  return validImages
}
