import { createContext, SetStateAction } from 'react'

interface GlobalContextType {
  userData: any
  setUserData: any
  userGroupData: any[]
  setUserGroupData: React.Dispatch<SetStateAction<any[]>>
  settings: any[]
  setSettings: React.Dispatch<SetStateAction<any[]>>
  tasks: any[]
  setTasks: React.Dispatch<SetStateAction<any[]>>
  statuses: any[]
  setStatuses: React.Dispatch<SetStateAction<any[]>>
  locationPermission: boolean
  setLocationPermission: React.Dispatch<SetStateAction<boolean>>
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

interface GlobalProviderProps {
  children: React.ReactNode
}
export const GlobalProvider = ({ children }: GlobalProviderProps) => {}
