import Searchbar from '@/components/features/tasks/Searchbar'
import TabTask from '@/components/features/tasks/TabTask'
import TaskHeaderContent from '@/components/features/tasks/TaskHeaderContent'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import useUserInfoStore from '@/store/userInfo'
import 'moment/locale/en-gb'
import 'moment/locale/he'
import React, { useMemo, useState } from 'react'
import { View } from 'react-native'

export default function Tasks() {
  const { userSettings } = useUserInfoStore()
  const [timeNow, setTimeNow] = useState<Date>(new Date())
  const matchLogo = userSettings.find((item) => item.key === 'tenantLogo')
  const [taskByStatuses, setTaskByStatuses] = useState<{
    [key: string]: any[]
  }>({})
  const [activeTab, setActiveTab] = useState('notDone')
  const [searchText, setSearchText] = useState('')

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
    console.log('parseValue', parseValue)

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

  const onRefreshTasks = async (isManual: boolean = false): Promise<void> => {
    setTimeNow(new Date())
    setSearchText('')
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerContent={
        <>
          <TaskHeaderContent
            timeNow={timeNow}
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
      <View>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
        <ThemedText>Task</ThemedText>
      </View>
    </ParallaxScrollView>
  )
}
