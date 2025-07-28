import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
  isLoggedIn: boolean
  token: string
  setAuthState: (isLoggedIn: boolean, token: string) => void
}

// Create the Zustand store
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      isLoggedIn: false,
      setAuthState: (isLoggedIn, token) => {
        set({ isLoggedIn, token })
      },
    }),

    {
      name: 'auth', // The name of the persisted storage
      // storage: zustandStorage, // Custom storage implementation
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export default useAuthStore
