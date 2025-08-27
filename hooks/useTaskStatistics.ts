import { useMemo } from 'react'
import { isToday, parseISO, format } from 'date-fns'
import { Task } from '@/store/tasks'

/**
 * User settings configuration interface
 */
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

/**
 * Task statistics interface for tracking different task counts
 */
export interface TaskStatistics {
  /** Number of tasks due today */
  openToday: number
  /** Number of tasks completed today */
  doneToday: number
  /** Number of tasks currently in progress */
  inProgress: number
  /** Combined count of open and in-progress tasks */
  openAndInProgress: number
}

/**
 * Task status configuration interface
 */
interface TaskStatusConfig {
  executableStatuses: string[]
  doneTaskStatuses: string[]
}

/**
 * Utility function to normalize status ID for comparison
 */
const normalizeStatusId = (statusId: string): string => 
  statusId.toLowerCase().trim()

/**
 * Utility function to check if a task date matches today
 */
const isTaskDateToday = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false
  try {
    return isToday(parseISO(dateString))
  } catch {
    return false
  }
}

/**
 * Parse user settings to extract task status configurations
 */
const parseTaskStatusConfig = (userSettings: Config[]): TaskStatusConfig => {
  const defaultConfig: TaskStatusConfig = {
    executableStatuses: ['assigned', 'inProgress'],
    doneTaskStatuses: []
  }

  if (!userSettings.length) return defaultConfig

  const executableSetting = userSettings.find(
    setting => setting.key === 'executableTaskStatuses'
  )
  const doneTaskSetting = userSettings.find(
    setting => setting.key === 'statusesRepresentingDoneTask'
  )

  return {
    executableStatuses: executableSetting?.value 
      ? JSON.parse(executableSetting.value)
      : defaultConfig.executableStatuses,
    doneTaskStatuses: doneTaskSetting?.value
      ? JSON.parse(doneTaskSetting.value)
      : defaultConfig.doneTaskStatuses
  }
}

/**
 * Calculate task statistics for a single task
 */
const calculateTaskStats = (
  task: Task,
  statusConfig: TaskStatusConfig
): Partial<TaskStatistics> => {
  const normalizedStatus = normalizeStatusId(task.statusId)
  const isTaskEndToday = isTaskDateToday(task.taskEndTime)
  const isExecutionEndToday = isTaskDateToday(task.executionEndDate)
  
  const stats: Partial<TaskStatistics> = {
    openToday: 0,
    doneToday: 0,
    inProgress: 0,
    openAndInProgress: 0
  }

  // Count completed tasks
  if (isTaskEndToday && normalizedStatus === 'done') {
    stats.doneToday = 1
  }

  // Count tasks due today that are assigned
  if (isExecutionEndToday && normalizedStatus === 'assigned') {
    stats.openToday = 1
  }

  // Count assigned tasks (for open & in progress total)
  if (normalizedStatus === 'assigned') {
    stats.openAndInProgress = 1
  }

  // Count in-progress tasks
  if (normalizedStatus === 'inprogress') {
    stats.openAndInProgress = 1
    stats.inProgress = 1
    
    // Additional logic for in-progress tasks due today
    if (
      isExecutionEndToday && 
      statusConfig.executableStatuses.includes(task.statusId)
    ) {
      stats.openToday = 1
    }
  }

  // Count tasks completed today with custom done statuses
  if (
    isTaskEndToday && 
    normalizedStatus !== 'done' &&
    statusConfig.doneTaskStatuses.includes(task.statusId)
  ) {
    stats.doneToday = 1
  }

  return stats
}

/**
 * Custom hook for calculating task statistics
 * 
 * This hook processes tasks and user settings to provide real-time
 * statistics about task counts across different categories.
 * 
 * @param tasks - Array of tasks to analyze
 * @param userSettings - User configuration settings
 * @returns TaskStatistics object with computed counts
 */
export const useTaskStatistics = (
  tasks: Task[],
  userSettings: Config[]
): TaskStatistics => {
  return useMemo(() => {
    if (!tasks.length) {
      return {
        openToday: 0,
        doneToday: 0,
        inProgress: 0,
        openAndInProgress: 0
      }
    }

    const statusConfig = parseTaskStatusConfig(userSettings)
    
    // Reduce tasks to accumulated statistics
    return tasks.reduce(
      (acc, task) => {
        const taskStats = calculateTaskStats(task, statusConfig)
        
        return {
          openToday: acc.openToday + (taskStats.openToday || 0),
          doneToday: acc.doneToday + (taskStats.doneToday || 0),
          inProgress: acc.inProgress + (taskStats.inProgress || 0),
          openAndInProgress: acc.openAndInProgress + (taskStats.openAndInProgress || 0)
        }
      },
      {
        openToday: 0,
        doneToday: 0,
        inProgress: 0,
        openAndInProgress: 0
      }
    )
  }, [tasks, userSettings])
}

/**
 * Custom hook for formatting dates without moment.js
 * 
 * @param date - Date to format
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const useFormattedDate = (date: Date = new Date()): string => {
  return useMemo(() => {
    return format(date, 'dd/MM/yyyy')
  }, [date])
}