// store/queue.ts
import { create } from 'zustand'

type QueueState = {
  isRunning: boolean
  runController: AbortController | null
  startRun: () => AbortController
  stopRun: () => void
  setIsRunning: (v: boolean) => void
}

export const useQueueStore = create<QueueState>()((set, get) => ({
  isRunning: false,
  runController: null,

  startRun: () => {
    const { isRunning, runController } = get()
    if (isRunning && runController) return runController
    const controller = new AbortController()
    set({ isRunning: true, runController: controller })
    return controller
  },

  stopRun: () => {
    const { runController } = get()
    if (runController && !runController.signal.aborted) {
      runController.abort()
    }
    set({ isRunning: false, runController: null })
  },

  setIsRunning: (v) => set({ isRunning: v }),
}))
