import useTaskStore from '@/store/tasks'

export const getNextTask = () => {
  const pendingTasks = useTaskStore.getState().pendingTasks
  return pendingTasks.length > 0 ? pendingTasks[0] : null
}
