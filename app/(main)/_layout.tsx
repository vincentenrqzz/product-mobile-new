import { useGetUser } from '@/queries/useUserInfo'
import { getForms } from '@/services/api/endpoints/forms'
import { getTaskDetails } from '@/services/api/endpoints/taskdetails'
import { getAllTasks, getTaskStatuses } from '@/services/api/endpoints/tasks'
import { getTaskTypes } from '@/services/api/endpoints/tasktypes'
import { getUserSettings } from '@/services/api/endpoints/user'
import useAuthStore from '@/store/auth'
import useFormsStore from '@/store/forms'
import useTaskStore from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'

import { useQueries } from '@tanstack/react-query'
import { Redirect, Stack } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

export default function AppLayout() {
  const { isLoggedIn } = useAuthStore()
  const { setUserInfo, setUserGroup, setUserSettings, userInfo } =
    useUserInfoStore()
  const { setTaskTypes, setTaskList, setTaskStatuses, setTaskDetails } =
    useTaskStore()
  const { setForms } = useFormsStore()

  // Fetch current user info (basic profile)
  const {
    data: user,
    isLoading: userIsLoading,
    isError: userIsError,
  } = useGetUser()

  // Only run queries if userInfo is not already loaded
  //!userInfo &&
  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['userSettings', user],
        queryFn: getUserSettings,
        enabled: !!user,
      },
      {
        queryKey: ['taskTypes', user],
        queryFn: getTaskTypes,
        enabled: !!user,
      },
      {
        queryKey: ['taskList', user],
        queryFn: getAllTasks,
        enabled: !!user,
      },
      {
        queryKey: ['taskStatuses', user],
        queryFn: getTaskStatuses,
        enabled: !!user,
      },
      {
        queryKey: ['taskDetails', user],
        queryFn: getTaskDetails,
        enabled: !!user,
      },
      {
        queryKey: ['forms', user],
        queryFn: getForms,
        enabled: !!user,
      },
    ],
  })

  const [
    {
      data: userSettings,
      isLoading: userSettingsIsLoading,
      isError: userSettingsIsError,
    },
    {
      data: taskTypes,
      isLoading: taskTypesIsLoading,
      isError: taskTypesIsError,
    },
    { data: taskList, isLoading: taskListIsLoading, isError: taskListIsError },
    {
      data: taskStatuses,
      isLoading: taskStatusIsLoading,
      isError: taskStatusIsError,
    },
    {
      data: taskDetails,
      isLoading: taskDetailsIsLoading,
      isError: taskDetailsIsError,
    },
    { data: forms, isLoading: formsIsLoading, isError: formsIsError },
  ] = queryResults

  // Set global state when all data is loaded (once)
  useEffect(() => {
    // if (userInfo) return // Prevent overwriting existing state
    // console.log('userSettings', userSettings)
    const dataMap = [
      { data: user, setData: setUserInfo },
      { data: userSettings || [], setData: setUserSettings },
      { data: taskTypes || [], setData: setTaskTypes },
      { data: taskList || null, setData: setTaskList },
      { data: taskStatuses || [], setData: setTaskStatuses },
      { data: taskDetails || [], setData: setTaskDetails },
      { data: forms || [], setData: setForms },
    ]

    dataMap.forEach(({ data, setData }) => {
      if (data) setData(data)
    })
  }, [
    userInfo,
    user,
    userSettings,
    taskTypes,
    taskList,
    taskStatuses,
    taskDetails,
    forms,
    setUserInfo,
    setUserSettings,
    setTaskTypes,
    setTaskList,
    setTaskStatuses,
    setTaskDetails,
    setForms,
  ])

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />
  }

  // Loading state
  const isLoading = [
    userIsLoading,
    userSettingsIsLoading,
    taskTypesIsLoading,
    taskListIsLoading,
    taskStatusIsLoading,
    taskDetailsIsLoading,
    formsIsLoading,
  ].some((loading) => loading)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    )
  }

  // Error state
  const isError = [
    userIsError,
    userSettingsIsError,
    taskTypesIsError,
    taskListIsError,
    taskStatusIsError,
    taskDetailsIsError,
    formsIsError,
  ].some((error) => error)

  if (isError && !userInfo) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Something went wrong. Please try again.</Text>
      </View>
    )
  }

  // Render layout once data is ready
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task-detail" />
      <Stack.Screen name="task-info" />
    </Stack>
  )
}
