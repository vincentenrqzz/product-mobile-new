import { ParsedFormField } from './form'

export type Task = {
  _id: string
  taskId: number
  taskDetails: any[]
  createdAt: string
  lastUpdatedAt: string
  lastUpdatedBy: string
  assignedTo: ''
  archivedAt: null | string
  form: null | ParsedFormField[]
  urgentTask?: boolean
  taskType: string
  statusId: string
  typeId: string
  isArchived: boolean
  executionStartDate: string | null
  executionEndDate: string | null
  groupName: string
  favoriteTask: boolean
}

export type CustomCreateData = {
  creationType: string
  userTimezone: string
  taskType: string
  executionEndDate?: string
  data: {
    familyId?: string
    needinessCode?: string
    needinessDsp?: string
    tasks?: Task
  }
}

export interface CustomCreateTaskParams {
  customCreateData: CustomCreateData
  token: string
}

export interface ChangeTaskStatusParams {
  taskId: number
  idToken: string
  wholeTask: Task
  taskTypes: any[]
  signal?: AbortSignal
}

export interface CreateTaskParams {
  values: any
  selectedType: string
  token: string
}

export const TaskStatuses = {
  new: 'New',
  assignFailed: 'Assign failed',
  assigned: 'Assigned',
  inProgress: 'In progress',
  done: 'Done',
  approved: 'Approved',
  escalate: 'Escalated',
  canceled: 'Canceled',
  onHold: 'On hold',
  notExecuted: 'Not executed',
} as const

export type TaskStatusKey = keyof typeof TaskStatuses
export type TaskStatusLabel = (typeof TaskStatuses)[TaskStatusKey]
