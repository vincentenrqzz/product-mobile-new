import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface CognitoIdTokenPayload {
  sub: string
  'cognito:groups': string[]
  'custom:insuranceCompanyId': string
  iss: string
  'custom:enableOtp': string
  preferred_username: string
  locale: string
  auth_time: number
  'custom:tenant': string
  exp: number
  'custom:role': string
  iat: number
  jti: string
  email: string
  email_verified: boolean
  phone_number_verified: boolean
  'cognito:username': string
  'custom:userId': string
  origin_jti: string
  aud: string
  event_id: string
  token_use: 'id' | 'access' | 'refresh'
  'custom:authorityId': string
  name: string
  phone_number: string
  family_name: string
  tenant: string
}

interface Config {
  _id: string
  key: string
  description: string
  value: any
  type: 'string' | 'boolean' | 'number' | 'Object' | 'array' | 'objectarray'
  subject: string
  __v: number
  hidden: boolean
}

interface AuthState {
  userInfo: CognitoIdTokenPayload | null
  userGroup: any[]
  userSettings: Config[] | []
  setUserInfo: (data: CognitoIdTokenPayload) => void
  setUserGroup: (data: any[]) => void
  setUserSettings: (data: Config[]) => void
  clearAll: () => void // Function to clear all state and AsyncStorage data
}

// Create the Zustand store
const useUserInfoStore = create<AuthState>()(
  persist(
    (set) => ({
      userInfo: null,
      userGroup: [],
      userSettings: [],
      setUserInfo: (data) => {
        set({ userInfo: data })
      },

      setUserGroup: (data) => {
        set({ userGroup: data })
      },
      setUserSettings: (data) => {
        set({ userSettings: data })
      },
      // Function to clear all state and AsyncStorage data
      clearAll: async () => {
        await AsyncStorage.clear() // Clears all data from AsyncStorage
        set({
          userInfo: null,
          userGroup: [],
          userSettings: [],
        }) // Reset the Zustand store state
      },
    }),

    {
      name: 'userInfo', // Name of the persisted storage
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for persistence
    },
  ),
)

export default useUserInfoStore
