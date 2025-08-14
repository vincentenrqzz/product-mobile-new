import useTaskStore from '@/store/tasks'
import * as Network from 'expo-network'
import { initBackgroundQueue } from './background'
import { networkWatchers } from './networkWatcher'
import { startQueueLoop, stopQueueLoop } from './startQueueLoop'

export const initTaskQueueSystem = async () => {
  console.log('[Queue Init] Initializing task queue system...')

  /// network watchers
  /// TBA queues mo stop if walay data ang pendingTask pero mo start mani siya automatic if naay pendingTask
  // mo listen ni siya sa internet if \
  // if walay internet kay automatic mo stop siya sa queues
  await networkWatchers(async (state) => {
    try {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[Network Restored] Starting queue loop...')
        startQueueLoop()
      } else {
        stopQueueLoop()
        console.log('[Network Lost] Waiting to retry...')
      }
    } catch (error) {
      console.log('networkWatchers error', error)
    }
  })

  // Task watcher → start when 0 → >0
  useTaskStore.subscribe(
    (s) => s.pendingTasks.length,
    (len, prevLen) => {
      if (prevLen === 0 && len > 0) {
        startQueueLoop()
      }
    },
  )
  /// initialize networks
  try {
    const state = await Network.getNetworkStateAsync()

    if (state.isConnected && state.isInternetReachable) {
      console.log('[Init] Device is online, starting initial queue run...')
      startQueueLoop()
    } else {
      console.log('[Init] Device is offline. Waiting for connectivity...')
    }
  } catch (err) {
    console.log('[Init Error] Failed to check network state:', err)
  }

  // Register background task
  await initBackgroundQueue()
}
