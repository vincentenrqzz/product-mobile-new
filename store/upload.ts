import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

interface AuthState {
  cancelAllUpload: boolean
  setCancelAllUpload: (data: boolean) => void
}

// Create the Zustand store
const useUploadStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        cancelAllUpload: false,
        setCancelAllUpload: (data) => {
          set({ cancelAllUpload: data })
        },
      }),

      {
        name: 'upload', // Name for persisting the store data
        storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage as storage
      },
    ),
  ),
)

export default useUploadStore
