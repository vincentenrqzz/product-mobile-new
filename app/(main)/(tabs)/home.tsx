import { LinearGradient } from 'expo-linear-gradient'
import { Animated, Dimensions, Text, View, useColorScheme } from 'react-native'

import KpiCard from '@/components/features/home/KpiCard'
// import { HelloWave } from '@/components/HelloWave'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import AppLogo from '@/components/ui/AppLogo'
import { useGetUserGroupData } from '@/queries/useUserInfo'
import useAuthStore from '@/store/auth'
import useTaskStore from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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

  // Modern UI state
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [isLoading, setIsLoading] = useState(true)

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current
  const headerSlideAnim = useRef(new Animated.Value(-30)).current

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
        bg: 'from-blue-500', // Updated to trigger blue gradients
        lightBG: 'bg-blue-400/20',
      },
      {
        key: 'doneToday',
        title: 'Done',
        value: stats.doneToday,
        icon: 'check-circle', // ✅
        bg: 'from-green-500', // Updated to trigger green gradients
        lightBG: 'bg-green-400/20',
      },
      {
        key: 'inProgress',
        title: 'In Progress',
        value: stats.inProgress,
        icon: 'spinner', // 🔄
        bg: 'from-amber-500', // Updated to trigger amber gradients
        lightBG: 'bg-amber-400/20',
      },
      {
        key: 'openAndInProgress',
        title: 'Open & In Progress',
        value: stats.openAndInProgress,
        icon: 'tasks', // 📝
        bg: 'from-purple-500', // Updated to trigger purple gradients
        lightBG: 'bg-purple-400/20',
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

  // Modern UI effects
  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Simulate loading completion
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(loadingTimer)
  }, [])

  // Loading state effect
  useEffect(() => {
    if (userGroupIsLoading) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [userGroupIsLoading])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: isDark ? '#1F2937' : '#F8FAFC',
        dark: '#1F2937',
      }}
      headerContent={
        <View className="relative overflow-hidden">
          {/* Background gradient */}
          <LinearGradient
            colors={
              isDark
                ? ['#1F2937', '#374151', '#4B5563']
                : ['#F8FAFC', '#F1F5F9', '#E2E8F0']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />

          {/* Glassmorphism overlay */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.02)'
                : 'rgba(255, 255, 255, 0.3)',
            }}
          />

          <Animated.View
            style={{
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            }}
            className="p-6 pb-8"
          >
            {/* Header top section */}
            <View className="mb-6 flex-row items-center justify-between">
              <AppLogo />
              <View
                className={`rounded-full px-3 py-1.5 ${
                  isDark ? 'bg-gray-800/50' : 'bg-white/50'
                } backdrop-blur-sm`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {envState} - v1.9.2
                </Text>
              </View>
            </View>

            {/* Welcome section without HelloWave */}
            <View className="flex-row items-center gap-4">
              {/* <HelloWave /> */}
              <View className="flex-1 gap-2">
                <Text
                  className={`text-3xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } leading-tight`}
                  style={{
                    textShadowColor: isDark
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(0, 0, 0, 0.1)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Welcome back
                </Text>
                <Text
                  className={`text-xl font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {`${userInfo?.name} ${userInfo?.family_name}!`}
                </Text>

                {/* Date badge */}
                <View
                  className={`mt-2 self-start rounded-full px-3 py-1 ${
                    isDark ? 'bg-blue-900/30' : 'bg-blue-100/80'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    {fullDate}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Decorative elements */}
          <View
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(59, 130, 246, 0.05)',
              transform: [{ scale: 0.5 }],
            }}
          />
          <View
            className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(16, 185, 129, 0.05)',
              transform: [{ scale: 0.3 }],
            }}
          />
        </View>
      }
    >
      {/* Modern KPI Cards Container */}
      <View
        className={`flex-1 px-4 py-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        {/* Loading state */}
        {isLoading && (
          <View className="absolute inset-0 z-10 flex-1 items-center justify-center">
            <View
              className={`rounded-2xl p-8 ${
                isDark ? 'bg-gray-800/90' : 'bg-white/90'
              } backdrop-blur-sm`}
            >
              <Text
                className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                } mb-2 text-center`}
              >
                Loading Dashboard...
              </Text>
              <View className="flex-row justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      isDark ? 'bg-blue-400' : 'bg-blue-500'
                    }`}
                    style={{
                      opacity: 0.3,
                      transform: [
                        {
                          scale:
                            1 +
                            Math.sin(Date.now() / 300 + (i * Math.PI) / 3) *
                              0.3,
                        },
                      ],
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Section header */}
        <View className="mb-6">
          <Text
            className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}
          >
            Today's Overview
          </Text>
          <Text
            className={`text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Track your task progress and productivity
          </Text>
        </View>

        {/* KPI Cards Grid */}
        <View className="flex-row flex-wrap justify-between">
          {cards.map((c, index) => (
            <View key={c.key} className="w-[48%] mb-4">
              <KpiCard
                title={c.title}
                value={c.value}
                icon={c.icon}
                bgColor={c.bg}
                lightBG={c.lightBG}
                index={index}
              />
            </View>
          ))}
        </View>

        {/* Announcements Section */}
        <View className="mt-8">
          <View className="mb-4">
            <Text
              className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2`}
            >
              📢 Announcements
            </Text>
            <Text
              className={`text-base ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Latest updates and important notifications
            </Text>
          </View>

          {/* Announcements List */}
          <View className="gap-3">
            {/* Important Announcement */}
            <View
              className={`rounded-2xl p-4 border-l-4 border-red-400 ${
                isDark ? 'bg-red-900/20' : 'bg-red-50'
              }`}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isDark ? 'bg-red-800/40' : 'bg-red-100'
                  }`}
                >
                  <Text className="text-red-500 font-bold text-sm">!</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-base mb-1 ${
                      isDark ? 'text-red-200' : 'text-red-800'
                    }`}
                  >
                    System Maintenance Notice
                  </Text>
                  <Text
                    className={`text-sm leading-5 ${
                      isDark ? 'text-red-300' : 'text-red-700'
                    }`}
                  >
                    Scheduled maintenance on {moment().add(2, 'days').format('MMM DD, YYYY')} from 2:00 AM - 4:00 AM. 
                    Some features may be temporarily unavailable.
                  </Text>
                  <Text
                    className={`text-xs mt-2 ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`}
                  >
                    {moment().subtract(2, 'hours').format('h:mm A')} • High Priority
                  </Text>
                </View>
              </View>
            </View>

            {/* New Feature Announcement */}
            <View
              className={`rounded-2xl p-4 border-l-4 border-blue-400 ${
                isDark ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isDark ? 'bg-blue-800/40' : 'bg-blue-100'
                  }`}
                >
                  <Text className="text-blue-500 font-bold text-sm">✨</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-base mb-1 ${
                      isDark ? 'text-blue-200' : 'text-blue-800'
                    }`}
                  >
                    New Dashboard Features Released!
                  </Text>
                  <Text
                    className={`text-sm leading-5 ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    Enhanced task analytics, improved mobile performance, and new dark mode support. 
                    Update to version 1.9.2 to enjoy the latest features.
                  </Text>
                  <Text
                    className={`text-xs mt-2 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {moment().subtract(1, 'day').format('h:mm A')} • New Feature
                  </Text>
                </View>
              </View>
            </View>

            {/* General Info Announcement */}
            <View
              className={`rounded-2xl p-4 border-l-4 border-green-400 ${
                isDark ? 'bg-green-900/20' : 'bg-green-50'
              }`}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isDark ? 'bg-green-800/40' : 'bg-green-100'
                  }`}
                >
                  <Text className="text-green-500 font-bold text-sm">📈</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-base mb-1 ${
                      isDark ? 'text-green-200' : 'text-green-800'
                    }`}
                  >
                    Weekly Performance Report
                  </Text>
                  <Text
                    className={`text-sm leading-5 ${
                      isDark ? 'text-green-300' : 'text-green-700'
                    }`}
                  >
                    Your team has completed 87% of assigned tasks this week. Great progress! 
                    Keep up the excellent work.
                  </Text>
                  <Text
                    className={`text-xs mt-2 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}
                  >
                    {moment().subtract(3, 'days').format('h:mm A')} • Weekly Update
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* View All Announcements Button */}
          <View
            className={`mt-4 rounded-2xl p-3 ${
              isDark ? 'bg-gray-800/50' : 'bg-white/80'
            } border backdrop-blur-sm ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <Text
              className={`text-center font-medium ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              View All Announcements →
            </Text>
          </View>
        </View>

        {/* Stats summary footer */}
        <View
          className={`mt-8 rounded-2xl p-4 ${
            isDark ? 'bg-gray-800/50' : 'bg-white/80'
          } border backdrop-blur-sm ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Total Tasks
              </Text>
              <Text
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {stats.openAndInProgress + stats.doneToday}
              </Text>
            </View>
            <View className="items-end">
              <Text
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Completion Rate
              </Text>
              <Text
                className={`text-2xl font-bold ${
                  stats.doneToday > 0
                    ? 'text-green-500'
                    : isDark
                      ? 'text-gray-300'
                      : 'text-gray-500'
                }`}
              >
                {stats.openAndInProgress + stats.doneToday > 0
                  ? Math.round(
                      (stats.doneToday /
                        (stats.openAndInProgress + stats.doneToday)) *
                        100,
                    )
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ParallaxScrollView>
  )
}
