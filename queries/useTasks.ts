import { GC_TIME, STALE_TIME } from '@/lib/utils'
import { getTaskDetails } from '@/services/api/endpoints/taskdetails'
import {
  changeTaskStatus,
  createTask,
  customCreateTask,
  getAllTasks,
  getTaskStatuses,
} from '@/services/api/endpoints/tasks'

import { getTaskTypes } from '@/services/api/endpoints/tasktypes'
import useUserInfoStore from '@/store/userInfo'
import {
  ChangeTaskStatusParams,
  CreateTaskParams,
  CustomCreateTaskParams,
  Task,
} from '@/types/task'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// TODO Add toast notification for failed task update

export const useChangeTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, ChangeTaskStatusParams>({
    mutationFn: ({ taskId, idToken, wholeTask, taskTypes, signal }) =>
      changeTaskStatus(taskId, idToken, wholeTask, taskTypes, signal),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['task', variables.taskId.toString()],
      })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error, variables, context) => {
      console.error('Failed to update task status:', error)
    },
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, CreateTaskParams>({
    mutationFn: ({ values, selectedType, token }) =>
      createTask(values, selectedType, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
    },
  })
}

export const useCustomCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, CustomCreateTaskParams>({
    mutationFn: ({ customCreateData, token }) =>
      customCreateTask(customCreateData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
    },
  })
}

export const useGetTaskTypes = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()
  return useQuery<any, Error>({
    queryKey: ['taskTypes', userInfo],
    queryFn: () => getTaskTypes(),
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useGetTaskList = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()

  return useQuery<any, Error>({
    queryKey: ['taskList', userInfo],
    queryFn: () => getAllTasks(),
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useGetTaskStatuses = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()
  return useQuery<any, Error>({
    queryKey: ['taskStatuses', userInfo],
    queryFn: () => getTaskStatuses(),
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useGetTaskDetails = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()
  return useQuery<any, Error>({
    queryKey: ['taskDetails', userInfo],
    queryFn: () => getTaskDetails(),
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}
