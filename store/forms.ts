import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface FormField {
  value: string | null
  displayValue: string
  layout: 'vertical' | 'horizontal' // Assuming two possible layouts
  taskDetailKey: string | null
  autocompleteKey: string | null
  autocompleteTable: string | null
  captureMode: string[] // Array of string, e.g., ['camera']
  itemLimit: number
  videoDurationLimit: number
  gallery: boolean
  _id: string
  key: string
  inputType: 'geo' | 'text' | 'number' | 'video' | 'file' | 'date' // Extendable based on the form field types
  note: string
  validation: string
  label: string
  description: string
  placeholder: string
  defaultValue: string
  __v: number
  conditions: Record<string, any> // Assuming this will be an object of conditions
  rules: {
    required: boolean
    actions: any[] // Assuming actions is an array that could hold any kind of data
  }
}

interface TaskForm {
  _id: string
  name: string
  description: string
  formFields: FormField[]
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  __v: number
}

type Forms = TaskForm[]

interface AuthState {
  forms: Forms | []
  setForms: (data: Forms) => void
  clearAll: () => void
}

// Create the Zustand store
const useFormsStore = create<AuthState>()(
  persist(
    (set) => ({
      forms: [],
      setForms: (data) => {
        set({ forms: data })
      },
      clearAll: async () => {
        await AsyncStorage.clear() // Clear all data from AsyncStorage
        set({ forms: [] }) // Reset the in-memory store state
      },
    }),

    {
      name: 'forms',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export default useFormsStore
