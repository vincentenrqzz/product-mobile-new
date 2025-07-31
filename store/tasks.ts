import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Form {
  execute: string
}

interface ConfigItem {
  _id: string
  key: string
  label: string
  description: string
  form: Form
  __v: number
}

type TaskTypes = ConfigItem[]

interface TaskDetailsIcons {
  mapIcon: string
}

export type Task = {
  __v: number
  _id: string
  archivedAt: string | null
  assignedTo: AssignedTo
  createdAt: string
  executionEndDate: string
  executionStartDate: string
  favoriteTask: boolean
  form: FormItem[]
  groupName: string
  isArchived: boolean
  lastUpdatedAt: string
  lastUpdatedBy: User
  newTaskUuid: string
  statusId: string
  taskDetails: TaskDetail[]
  taskId: number
  taskType: string
  typeId: string
  urgentTask: boolean
}

type AssignedTo = {
  agentGroups: string
  agentName: string
  agentSub: string
}

type User = {
  userGroups: string
  userName: string
  userSub: string
}

type FormItem = {
  autocompleteKey: string | null
  autocompleteTable: string | null
  captureMode: any[]
  defaultValue: string
  description: string
  displayValue: string
  inputType: string
  itemLimit: number
  key: string
  label: string
  layout: string
  note: string
  placeholder: string
  rules: any[]
  taskDetailKey: string | null
  uniqueId: string
  validation: string
  value: string | null
  videoDurationLimit: number
}

type TaskDetail = {
  inputType: string
  key: string
  label: string
  order: number | null
  orderMobile: number | null
  showInTable: boolean
  value: string | null
  format?: string
  fromDefaultProp?: boolean
}

export interface TaskList {
  googleApiKey: string
  mobileTaskDetailsNumber: string
  page: number
  pageSize: number
  taskDetailsIcons: any
  tasks: any[]
  totalDocuments: number
}

interface TaskStatus {
  _id: string
  Key: string
  color: string
  colorMobile: string
  isSystemStatus: boolean
  label: string
  order: number
  state: 'enabled' | 'disabled'
  systemStatusKey: string | null
  description?: string
  isImmutable: boolean
  __v: number
}

type TaskStatuses = TaskStatus[]

interface Field {
  _id: string
  description: string
  enum: string[]
  fromDefaultProp: boolean
  inputType: string
  key: string
  label: string
  order: number
  orderMobile: number
  showInTable: boolean
  showInTemplate: boolean
  showOnExport: boolean
  format?: string
  __v?: number
}

type TaskDetails = Field[]

interface AuthState {
  taskList: TaskList | null
  taskStatuses: TaskStatuses | []
  taskTypes: TaskTypes | []
  taskDetails: TaskDetails | []
  pendingTasks: any[] | []
  successTaskIds: any[]
  tasks: Task[] | []
  setTaskTypes: (data: any) => void
  setTaskList: (data: TaskList) => void
  setTaskStatuses: (data: TaskStatuses) => void
  setTaskDetails: (data: TaskDetails) => void
  setPendingTasks: (data: any[]) => void
  setTasks: (data: any[]) => void
  setSuccessTaskIds: (data: any[]) => void
  clearAll: () => void // Added clearAll method to reset the store state and clear AsyncStorage
}

// Create the Zustand store
const useTaskStore = create<AuthState>()(
  persist(
    (set, get) => ({
      taskStatuses: [],
      taskList: null,
      taskTypes: [],
      taskDetails: [],
      pendingTasks: [],
      tasks: [],
      successTaskIds: [],
      setTaskTypes: (data) => {
        set({ taskTypes: data })
      },
      setTaskList: (data) => {
        if (!data) {
          return
        }
        const { taskTypes } = get() // Access taskTypes from the store's state

        set({ taskList: data })

        data.tasks = data.tasks.map((item) => {
          const getTaskType = taskTypes.find(
            (task: { key: any }) => task.key === item.taskType,
          )

          const getTaskDetailsIndex = item.taskDetails.findIndex(
            (details: { key: string }) => details.key === 'taskType',
          )

          if (getTaskType && getTaskDetailsIndex !== -1) {
            item.taskType = getTaskType?.label
            item.taskDetails[getTaskDetailsIndex].value = getTaskType?.label
          }

          return item
        })

        set({ tasks: data.tasks })
      },
      setPendingTasks: (data) => {
        set({ pendingTasks: data })
      },
      setSuccessTaskIds: (data) => {
        set({ successTaskIds: data })
      },
      setTasks: (data) => {
        set({ tasks: data })
      },

      setTaskStatuses: (data) => {
        set({ taskStatuses: data })
      },
      setTaskDetails: (data) => {
        set({ taskDetails: data })
      },
      clearAll: async () => {
        await AsyncStorage.clear() // Clear all data from AsyncStorage
        // Reset all relevant store state fields to their initial values
        set({
          taskList: null,
          taskStatuses: [],
          taskTypes: [],
          taskDetails: [],
        })
      },
    }),

    {
      name: 'tasks', // The name of the persisted storage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export default useTaskStore
