import { registerBackgroundQueueTask } from './registerBackgroundQueueTask'

export const initBackgroundQueue = async () => {
  await registerBackgroundQueueTask()
}
