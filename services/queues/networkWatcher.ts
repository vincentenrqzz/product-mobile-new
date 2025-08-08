import { EventSubscription } from 'expo-modules-core'
import * as Network from 'expo-network'

let subscription: EventSubscription | null = null

export const networkWatchers = async (
  onChange: (state: Network.NetworkState) => void,
) => {
  if (subscription) return // Already watching

  subscription = Network.addNetworkStateListener((state) => {
    console.log('[Network Watcher] Changed:', state)
    onChange(state)
  })
}

export const stopNetworkWatchers = () => {
  if (subscription) {
    subscription.remove()
    subscription = null
    console.log('[Network Watcher] Stopped watching')
  }
}

export const getConnectionState = async (): Promise<Network.NetworkState> => {
  try {
    const state = await Network.getNetworkStateAsync()
    return state
  } catch (err) {
    console.error('[Network] Error checking connection type:', err)
    throw err
  }
}

export function isConnectedNow(): any {
  throw new Error('Function not implemented.')
}
