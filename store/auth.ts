import { BASE_URLS } from '@/constants/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import useFormsStore from './forms'
import useTaskStore from './tasks'
import useUserInfoStore from './userInfo'

interface AuthState {
  isLoggedIn: boolean
  token: string
  setAuthState: (isLoggedIn: boolean, token: string) => void
  logout: () => void // Add logout function to reset state and clear AsyncStorage
  baseUrl: any
  SetBaseUrl: (data: any) => void // Add logout function to reset state and clear AsyncStorage
  envState: string
  setEnvState: (data: string) => void
}

// Create the Zustand store
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      isLoggedIn: false,
      baseUrl: BASE_URLS.dev,
      envState: 'DEV',
      setEnvState: (data) => {
        set({ envState: data })
      },
      SetBaseUrl: (data) => {
        set({ baseUrl: data })
      },
      setAuthState: (isLoggedIn, token) => {
        set({ isLoggedIn, token })
      },
      logout: async () => {
        // Clear AsyncStorage and reset the store state for auth
        await AsyncStorage.clear() // Clears all data from AsyncStorage

        // Call the clearAll functions from other stores
        useTaskStore.getState().clearAll() // Call clearAll of task store
        useUserInfoStore.getState().clearAll() // Call clearAll of user info store
        useFormsStore.getState().clearAll()
        // Reset the auth store state
        set({ isLoggedIn: false, token: '' }) // Reset auth store state to initial values
      },
    }),

    {
      name: 'auth', // Name for persisting the store data
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage as storage
    },
  ),
)

export default useAuthStore
