// import { MMKV } from 'react-native-mmkv'

// export const storage = new MMKV()

// export interface ZustandStorage {
//   clearAll: () => Promise<void>
//   clearExcept: (keysToKeep?: string[]) => Promise<void>
//   getItem: <T>(name: string) => Promise<null | T>
//   removeItem: (name: string) => Promise<void>
//   setItem: <T>(name: string, value: T) => Promise<void>
// }

// const zustandStorage: ZustandStorage = {
//   clearAll: async () => {
//     storage.clearAll()
//   },

//   clearExcept: async (keysToKeep = []) => {
//     const allKeys = storage.getAllKeys()
//     allKeys.forEach((key) => {
//       if (!keysToKeep.includes(key)) {
//         storage.delete(key)
//       }
//     })
//   },

//   getItem: async <T>(name: string): Promise<null | T> => {
//     const value = storage.getString(name)
//     return value ? (JSON.parse(value) as T) : null
//   },

//   removeItem: async (name: string) => {
//     storage.delete(name)
//   },

//   setItem: async <T>(name: string, value: T) => {
//     storage.set(name, JSON.stringify(value))
//   },
// }

const zustandStorage = {}
export default zustandStorage
