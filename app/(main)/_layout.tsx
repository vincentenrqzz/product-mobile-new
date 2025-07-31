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
  const { isLoggedIn, token, setAuthState, logout } = useAuthStore()
  const { setUserInfo, setUserGroup, setUserSettings } = useUserInfoStore()
  const { setTaskTypes, setTaskList, setTaskStatuses, setTaskDetails } =
    useTaskStore()
  const { setForms } = useFormsStore()

  // Fetch data using the custom hooks for different API calls
  const {
    data: user,
    isLoading: userIsLoading,
    isError: userIsError,
  } = useGetUser()

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />
  }
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

  // Extracting the result data, loading, and error states
  const [
    // { data: user, isLoading: userIsLoading, isError: userIsError },
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

  // Handle setting the data in global state after successful fetch
  useEffect(() => {
    // Centralized data handling for all queries
    const dataMap = [
      { data: user, setData: setUserInfo },
      // { data: userGroup, setData: setUserGroup },
      { data: userSettings || [], setData: setUserSettings },
      { data: taskTypes || [], setData: setTaskTypes },
      { data: taskList || null, setData: setTaskList },
      { data: taskStatuses || [], setData: setTaskStatuses },
      { data: taskDetails || [], setData: setTaskDetails },
      { data: forms || [], setData: setForms },
    ]

    dataMap.forEach(({ data, setData }) => {
      if (data) {
        setData(data)
      }
    })
  }, [
    user,
    // userGroup,
    userSettings,
    taskTypes,
    taskList,
    taskStatuses,
    taskDetails,
    forms,
    setUserInfo,
    setUserGroup,
    setUserSettings,
    setTaskTypes,
    setTaskList,
    setTaskStatuses,
    setTaskDetails,
    setForms,
  ])

  // Show loading spinner if any of the queries are still loading
  const isLoading = [
    userIsLoading,
    // userGroupIsLoading,
    userSettingsIsLoading,
    taskTypesIsLoading,
    taskListIsLoading,
    taskStatusIsLoading,
    taskDetailsIsLoading,
    formsIsLoading,
  ].some((loading) => loading)

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  // Show an error message if any query failed
  const isError = [
    userIsError,
    // userGroupIsError,
    userSettingsIsError,
    taskTypesIsError,
    taskListIsError,
    taskStatusIsError,
    taskDetailsIsError,
    formsIsError,
  ].some((error) => error)

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Something went wrong. Please try again.</Text>
      </View>
    )
  }

  // Once all data is loaded, render the layout
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task-detail" options={{ headerShown: false }} />
    </Stack>
  )
}
