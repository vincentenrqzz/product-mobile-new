import Searchbar from '@/components/features/tasks/Searchbar'
import TabTask from '@/components/features/tasks/TabTask'
import TaskHeaderContent from '@/components/features/tasks/TaskHeaderContent'
import TaskList from '@/components/features/tasks/TaskList'
import ParallaxView from '@/components/ParallaxView'
import { useAppTheme } from '@/hooks/useAppTheme'
import getTaskByStatus from '@/lib/getTaskByStatus'
import { safeGetTime } from '@/lib/safeDate'
import useTaskStore, { Task } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import moment from 'moment-timezone'
import 'moment/locale/en-gb'
import 'moment/locale/he'
import React, { useEffect, useMemo, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

/**
 * Modern Tasks Component - Main task management interface
 * Features: Gradient backgrounds, smooth animations, enhanced UX
 */
export default function Tasks() {
  // built-in
  const queryClient = useQueryClient()
  const { colors, isDark } = useAppTheme()
  const screenHeight = Dimensions.get('window').height

  //store
  const { userSettings, userInfo } = useUserInfoStore()
  const { tasks, pendingTasks, successTaskIds } = useTaskStore()

  //state
  const [timeNow, setTimeNow] = useState<string | Date>('')
  const matchLogo = userSettings.find((item) => item.key === 'tenantLogo')
  const [taskByStatuses, setTaskByStatuses] = useState<{
    [key: string]: any[]
  }>({})
  const [activeTab, setActiveTab] = useState('notDone')
  const [searchText, setSearchText] = useState('')
  const [filteredTasks, setFilteredTasks] = useState<Task[] | []>(tasks)
  const [selectedType, setSelectedType] = useState('')
  const [timeTicker, setTimeTicker] = useState('')
  const [isRefresh, setIsRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Animation values
  const scrollY = useSharedValue(0)
  const headerOpacity = useSharedValue(1)
  //memo
  const statusesTabs = useMemo(() => {
    const match = userSettings.find((item) => item.key === 'statusesOnTabs')

    const defaultTask = {
      notDone: [],
      done: [],
      pending: [],
      escalate: [],
    }

    const defaultLabel = {
      notDone: ['assigned', 'inprogress'],
      done: ['done', 'approved'],
      pending: ['pending'],
      escalate: ['escalate'],
    }

    if (!match) {
      setTaskByStatuses(defaultTask)
      return defaultLabel
    }

    const parseValue =
      match?.type === 'Object' ? JSON.parse(match?.value) : match?.value

    if (typeof parseValue !== 'object' || parseValue === null) {
      setTaskByStatuses(defaultTask)
      return defaultLabel
    }

    const forLabels = Object.entries(parseValue).map(([key, value]) => [
      key,
      value,
    ])

    forLabels.splice(2, 0, ['pending', ['pending']])

    const forDisplayingLabels = Object.fromEntries(forLabels)
    const forTasks = Object.entries(parseValue).map(([key]) => [
      key.toLowerCase(),
      [],
    ])

    forTasks.splice(2, 0, ['pending', []])

    const forDisplayingTasks = Object.fromEntries(forTasks)
    setTaskByStatuses(forDisplayingTasks)

    return forDisplayingLabels
  }, [userSettings])

  const statusesTabOnSort = useMemo(() => {
    const match = userSettings.find((item) => item.key === 'statusesTabOnSort')
    if (match) {
      return JSON.parse(match.value)
    } else {
      return { notDone: -1, done: -1, escalate: -1 }
    }
  }, [userSettings])

  const taskType: string[] = useMemo(() => {
    const set = new Set<string>()

    for (const item of tasks) set.add(item.taskType)

    return Array.from(set)
  }, [tasks])

  const dynamicTabs = useMemo(
    () =>
      Object.keys(statusesTabs).map((statusKey) => {
        return {
          key: statusKey,
          renderTasks: () => {
            return taskByStatuses[statusKey]
          },
        }
      }),
    [statusesTabs, taskByStatuses],
  )
  const tasksToDisplay = useMemo(() => {
    return (
      dynamicTabs.find((item) => item.key === activeTab)?.renderTasks() ?? []
    )
  }, [dynamicTabs, activeTab])

  const dateSeparator = useMemo(() => {
    const match = userSettings.find(
      (item) => item.key === 'appTasksDefaultSortOrder',
    )

    if (!match) return false

    const value = JSON.parse(match.value)

    return !!(value?.executionEndDate || value?.walkOrder)
  }, [userSettings])

  //functions
  const segregateByStatus = async (taskList: Task[]) => {
    const existingTaskIds = Array.from(
      new Set(successTaskIds.map((task: any) => task.taskId)),
    )

    const res: any = {}

    for (const task of taskList) {
      const isStillPending = getTaskByStatus(
        pendingTasks,
        task.taskId,
        'pending',
      )
      const isStillPendingByStatus = getTaskByStatus(
        pendingTasks,
        task.taskId,
        'not-pending',
      )
      if (isStillPending) {
        if (!res['pending']) res['pending'] = []
        res['pending'].push(task)
        continue
      }
      if (isStillPendingByStatus) {
        task.statusId = isStillPendingByStatus.partialStatus
      }

      for (const tabKey of Object.keys(statusesTabs)) {
        const statusArray = statusesTabs[tabKey]
        const statusesArr = statusArray.map((item: any) => item.toLowerCase())

        if (
          (tabKey === 'notDone' || tabKey === 'escalate') &&
          existingTaskIds.includes(task.taskId)
        ) {
          continue
        }

        if (!res[tabKey]) res[tabKey] = []
        if (statusesArr.includes(task.statusId.toLowerCase())) {
          res[tabKey].push(task)
        }
      }
    }

    Object.keys(res).forEach((tabKey) => {
      if (res[tabKey]) {
        res[tabKey].sort((a: any, b: any) => {
          const timeA = safeGetTime(a.executionEndDate)
          const timeB = safeGetTime(b.executionEndDate)

          if (timeA === 0 && timeB === 0) return 0
          if (timeA === 0) return 1
          if (timeB === 0) return -1

          return statusesTabOnSort[tabKey] === 1 ? timeA - timeB : timeB - timeA
        })
      }
    })

    setTaskByStatuses(res)
  }
  const sortedFilteredTasks = async (filterTask: Task[]) => {
    let tasksSliced: Task[] = filterTask?.slice() || []
    let tempFilteredTasks: Task[] = tasksSliced
    setFilteredTasks(tempFilteredTasks)
  }
  const onRefreshTasks = async (isManual: boolean = false): Promise<void> => {
    setTimeNow('')
    setSearchText('')
  }
  const filterByType = (data: any[], matchType: string) => {
    if (!matchType) {
      return data
    }

    const loweredType = matchType.toLowerCase()
    return data.filter((item) => item.taskType?.toLowerCase() === loweredType)
  }
  const filterByDate = (data: any[], matchDate: string | null) => {
    if (!matchDate) {
      return data
    }

    return data.filter((item) => {
      // Skip items without valid execution end date
      if (!item.executionEndDate) {
        return false
      }

      try {
        const itemDateInIsrael = moment
          .utc(item.executionEndDate)
          .tz('Asia/Jerusalem')
          .format('DD/MM/YYYY')

        const matchDateString = moment(matchDate).format('DD/MM/YYYY')

        return itemDateInIsrael === matchDateString
      } catch (error) {
        // If date parsing fails, exclude the item from results
        console.warn(
          'Failed to parse date for filtering:',
          item.executionEndDate,
          error,
        )
        return false
      }
    })
  }
  const filterBySearch = (data: any[], searchValue: string) => {
    if (!searchValue) {
      return data
    }

    const loweredSearch = searchValue.toLowerCase()

    return data.filter((item) => {
      return item.taskDetails.some(
        (detail: any) =>
          detail.value &&
          detail.value.toString().toLowerCase().includes(loweredSearch),
      )
    })
  }

  const filterTasks = ({
    taskToFilter = [],
    type = '',
    time = '',
    searchText = '',
  }: any) => {
    let result = filterByType(taskToFilter, type)
    result = filterByDate(result, time)
    return filterBySearch(result, searchText)
  }

  const initTimeTicker = () => {
    return setInterval(() => {
      const currentTime = moment().format('DD/MM/YYYY HH:mm')
      const hasSameTime = currentTime === timeTicker

      if (hasSameTime) {
        return
      }
      setTimeTicker(currentTime)
    }, 1000)
  }

  const onRefetchTask = async () => {
    try {
      setIsRefresh(true)
      setIsLoading(true)

      const keys: string[][] = [
        ['userSettingss'],
        ['taskTypess'],
        ['taskLists'],
        ['taskStatusess'],
        ['taskDetailss'],
        ['formss'],
      ]

      await Promise.all(
        keys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
      )
    } catch (error) {
      console.error('Failed to refetch tasks:', error)
    } finally {
      setIsRefresh(false)
      setIsLoading(false)
    }
  }

  // Animated header styles
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.9],
      Extrapolate.CLAMP,
    )

    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.98],
      Extrapolate.CLAMP,
    )

    return {
      opacity,
      transform: [{ scale }],
    }
  })

  //mount unmount
  useEffect(() => {
    const interval = initTimeTicker()

    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    segregateByStatus(tasks)
  }, [tasks])

  useEffect(() => {
    segregateByStatus(filteredTasks)
  }, [filteredTasks])

  useEffect(() => {
    const res = filterTasks({
      taskToFilter: tasks,
      type: selectedType,
      time: timeNow,
      searchText: searchText || '',
    })
    sortedFilteredTasks(res)
  }, [tasks, selectedType, timeNow, searchText])

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['#1a1a2e', '#16213e', '#0f3460']
            : ['#ffffff', '#f8faff', '#e8f4f8']
        }
        style={StyleSheet.absoluteFillObject}
      />

      <ParallaxView
        headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
        style={{ backgroundColor: 'transparent' }}
        headerContent={
          <Animated.View
            style={[animatedHeaderStyle]}
            entering={FadeInDown.duration(600).springify()}
          >
            {/* Modern Header with Glassmorphism Effect */}
            <View className="relative">
              {/* Header Background Blur */}
              <LinearGradient
                colors={
                  isDark
                    ? ['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.9)']
                    : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 255, 0.9)']
                }
                className="absolute inset-0 rounded-b-3xl"
              />

              {/* Header Content */}
              <View
                className="rounded-b-3xl border-b-2 px-4 py-2"
                style={{
                  borderBottomColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                <TaskHeaderContent
                  timeNow={timeTicker}
                  matchLogo={matchLogo}
                  setTimeNow={setTimeNow}
                  onRefreshTasks={onRefreshTasks}
                />

                {/* Enhanced Search and Tab Section */}
                <View className="mt-4">
                  <Searchbar
                    value={searchText}
                    onChangeText={setSearchText}
                    searchbarBackgroundColor={{
                      light: 'rgba(228, 242, 247, 0.8)',
                      dark: 'rgba(38, 63, 73, 0.8)',
                    }}
                    setTimeNow={setTimeNow}
                    onRefreshTasks={onRefreshTasks}
                    timeNow={timeNow}
                  />
                  <View className="mt-2">
                    <TabTask
                      statusesTabs={statusesTabs}
                      setActiveTab={setActiveTab}
                      activeTab={activeTab}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        }
      >
        {/* Enhanced Task List Container */}
        <Animated.View
          entering={FadeIn.duration(800).delay(200)}
          className="flex-1"
        >
          <TaskList
            tasks={tasksToDisplay}
            dateSeparator={dateSeparator}
            forEscalate={activeTab}
            onRefetchTask={onRefetchTask}
            isRefresh={isRefresh}
          />
        </Animated.View>
      </ParallaxView>
    </View>
  )
}

// Modern Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  headerGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  darkHeaderGlass: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 8,
  },
})
