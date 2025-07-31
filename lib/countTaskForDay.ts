import { Task } from '@/store/tasks'
import toIsraelTime from './toIsraelTime'

const countTasksForDay = (targetDate: any, tasks: Task[]) => {
  const targetIsraelDate = toIsraelTime(targetDate).format('DD/MM/YYYY')
  return tasks.filter((task: any) => {
    const taskIsraelDate = toIsraelTime(task.executionEndDate).format(
      'DD/MM/YYYY',
    )
    return taskIsraelDate === targetIsraelDate
  }).length
}

export default countTasksForDay
