import { View } from 'react-native'

import KpiCard from '@/components/features/home/KpiCard'
import { HelloWave } from '@/components/HelloWave'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import AppLogo from '@/components/ui/AppLogo'
import { useGetUserGroupData } from '@/queries/useUserInfo'
import useAuthStore from '@/store/auth'
import useTaskStore from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'react-native'

export default function Home() {
  //store
  const { userInfo, userSettings, setUserGroup } = useUserInfoStore()
  const { envState } = useAuthStore()
  const { tasks } = useTaskStore()
  const {
    data: userGroup,
    isLoading: userGroupIsLoading,
    isError: userGroupIsError,
  } = useGetUserGroupData()

  //state
  const date = new Date()
  const fullDate =
    date.getDate() +
    '/' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getUTCFullYear()
  const matchLogo = userSettings?.find((item) => item.key === 'tenantLogo')
  const [stats, setStats] = useState({
    openToday: 0,
    doneToday: 0,
    inProgress: 0,
    openAndInProgress: 0,
  })

  //memo
  const showSupportedStatusesForStartTask = useMemo(() => {
    if (userSettings.length === 0) return ['assigned', 'inProgress']
    const res = userSettings.find(
      (item) => item.key === 'executableTaskStatuses',
    )
    return res?.value ? JSON.parse(res?.value) : ['assigned', 'inProgress']
  }, [userSettings])

  const getStatusRepInDoneTask = useMemo(() => {
    if (userSettings.length === 0) return

    const res = userSettings.find(
      (item) => item.key === 'statusesRepresentingDoneTask',
    )

    return JSON.parse(res?.value)
  }, [userSettings])

  const cards = useMemo(
    () => [
      {
        key: 'openToday',
        title: 'Open',
        value: stats.openToday,
        icon: 'folder-open', // 📂
        bg: 'bg-blue-500', // light blue
        lightBG: 'bg-blue-400',
      },
      {
        key: 'doneToday',
        title: 'Done',
        value: stats.doneToday,
        icon: 'check-circle', // ✅
        bg: 'bg-green-500', // light green
        lightBG: 'bg-green-400',
      },
      {
        key: 'inProgress',
        title: 'In Progress',
        value: stats.inProgress,
        icon: 'spinner', // 🔄
        bg: 'bg-yellow-500', // light yellow
        lightBG: 'bg-yellow-400',
      },
      {
        key: 'openAndInProgress',
        title: 'Open & In Progress',
        value: stats.openAndInProgress,
        icon: 'tasks', // 📝
        bg: 'bg-purple-500', // light purple
        lightBG: 'bg-purple-400',
      },
    ],
    [stats],
  )

  //functions
  const initTaskCount = useCallback(
    (initTasks: any[]) => {
      let openAndProgressTaskCnt = 0
      let openTasksTodayCnt = 0
      let inprogressTasksCnt = 0
      let doneTasksTodayCnt = 0
      const todayDate = moment(date).format('YYYY/MM/DD')

      initTasks.forEach((task) => {
        if (
          todayDate === moment.utc(task.taskEndTime).format('YYYY/MM/DD') &&
          task.statusId.toLowerCase().trim() === 'done'
        ) {
          doneTasksTodayCnt++
        }
        if (
          todayDate ===
            moment.utc(task.executionEndDate).format('YYYY/MM/DD') &&
          task.statusId.toLowerCase().trim() === 'assigned'
        ) {
          openTasksTodayCnt++
        }
        if (task.statusId.toLowerCase().trim() === 'assigned') {
          openAndProgressTaskCnt++
        }
        if (task.statusId.toLowerCase().trim() === 'inprogress') {
          openAndProgressTaskCnt++
          inprogressTasksCnt++
          if (
            todayDate ===
              moment.utc(task.executionEndDate).format('YYYY/MM/DD') &&
            showSupportedStatusesForStartTask?.includes(task.statusId)
          ) {
            openTasksTodayCnt++
          }
        }
        if (
          todayDate === moment.utc(task.taskEndTime).format('YYYY/MM/DD') &&
          task.statusId.toLowerCase().trim() !== 'done' &&
          getStatusRepInDoneTask?.includes(task.statusId)
        ) {
          doneTasksTodayCnt++
        }
      })

      setStats({
        openToday: openTasksTodayCnt,
        doneToday: doneTasksTodayCnt,
        inProgress: inprogressTasksCnt,
        openAndInProgress: openAndProgressTaskCnt,
      })
    },
    [date, showSupportedStatusesForStartTask, getStatusRepInDoneTask],
  )

  //effects
  useEffect(() => {
    if (userGroup) {
      setUserGroup(userGroup)
    }
  }, [userGroup])

  useEffect(() => {
    initTaskCount(tasks)
  }, [userSettings, tasks])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFF', dark: '#FFF' }}
      headerContent={
        <View className="border-b-2 border-b-gray-100">
          <View className="flex-row items-center justify-between">
            <AppLogo />
            <Text className="text-lg font-bold">
              {envState} - Version 1.9.2
            </Text>
          </View>
          {/* <View className="flex-row items-center gap-4">
            <AppLogo />
            <Text>{fullDate}</Text>
          </View> */}
          <View className="flex-row   gap-3">
            <HelloWave />
            <View className="gap-2">
              <Text className="text-3xl font-bold">Welcome back</Text>
              <Text className="text-xl font-medium text-gray-700">{`${userInfo?.name} ${userInfo?.family_name} !`}</Text>
            </View>
          </View>
        </View>
      }
    >
      {/* ONE MAP — wraps into 2x2 while keeping the same look */}
      <View className="flex-1 flex-row flex-wrap  justify-evenly gap-2">
        {cards.map((c) => (
          <KpiCard
            key={c.key}
            title={c.title}
            value={c.value}
            icon={c.icon}
            bgColor={c.bg}
            lightBG={c.lightBG}
          />
        ))}
      </View>
    </ParallaxScrollView>
  )
}
