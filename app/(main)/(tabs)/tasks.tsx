import Searchbar from '@/components/features/tasks/Searchbar'
import TabTask from '@/components/features/tasks/TabTask'
import TaskHeaderContent from '@/components/features/tasks/TaskHeaderContent'
import TaskList from '@/components/features/tasks/TaskList'
import ParallaxView from '@/components/ParallaxView'
import getTaskByStatus from '@/lib/getTaskByStatus'
import useTaskStore, { Task } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import moment from 'moment-timezone'
import 'moment/locale/en-gb'
import 'moment/locale/he'
import React, { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

export default function Tasks() {
  //store
  const { userSettings, userInfo } = useUserInfoStore()
  const { tasks, pendingTasks, successTaskIds } = useTaskStore()
  console.log('tasks', tasks)
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
          const dateA = a.executionEndDate
            ? new Date(a.executionEndDate)
            : new Date(0)
          const dateB = b.executionEndDate
            ? new Date(b.executionEndDate)
            : new Date(0)

          if (dateA.getTime() === 0 && dateB.getTime() === 0) return 0

          if (dateA.getTime() === 0) return 1
          if (dateB.getTime() === 0) return -1

          return statusesTabOnSort[tabKey] === 1
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime()
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
      const itemDateInIsrael = moment
        .utc(item.executionEndDate)
        .tz('Asia/Jerusalem')
        .format('DD/MM/YYYY')

      const matchDateString = moment(matchDate).format('DD/MM/YYYY')
      console.log('itemDateInIsrael', itemDateInIsrael)
      console.log('matchDateString', matchDateString)

      return itemDateInIsrael === matchDateString
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
    console.log('result', result)
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
    <ParallaxView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerContent={
        <>
          <TaskHeaderContent
            timeNow={timeTicker}
            matchLogo={matchLogo}
            setTimeNow={setTimeNow}
            onRefreshTasks={onRefreshTasks}
          />
          <View>
            <Searchbar
              value={searchText}
              onChangeText={setSearchText}
              searchbarBackgroundColor={{ light: '#E4F2F7', dark: '#263F49' }}
              setTimeNow={setTimeNow}
              onRefreshTasks={onRefreshTasks}
              timeNow={timeNow}
            />
            <TabTask
              statusesTabs={statusesTabs}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
          </View>
        </>
      }
    >
      <TaskList
        tasks={tasksToDisplay}
        dateSeparator={dateSeparator}
        forEscalate={activeTab}
      />
    </ParallaxView>
  )
}
