import useTaskStore from '@/store/tasks'

export const updateTaskImages = (taskId: string, newImages: string[]) => {
  const pendingTasks = useTaskStore.getState().pendingTasks

  const updatedTasks = pendingTasks.map((task) =>
    task.taskId === taskId ? { ...task, images: newImages } : task,
  )

  useTaskStore.setState({ pendingTasks: updatedTasks })
}
