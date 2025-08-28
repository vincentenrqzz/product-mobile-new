import ParallaxScrollView from '@/components/ParallaxScrollView'
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/constants'
import parseValueForRender from '@/lib/parseValueForRenderer'
import useTaskStore from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { Task, TaskStatusLabel } from '@/types/task'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

/**
 * TaskDetail - Modernized task detail page with comprehensive UI/UX improvements
 * Features:
 * - Modern card-based layout with gradients and glassmorphism
 * - Enhanced typography and spacing
 * - Dark mode support throughout
 * - Status-based color schemes
 * - Smooth animations and press feedback
 * - Improved accessibility and performance
 */
const TaskDetail = () => {
  // Built-in hooks
  const router = useRouter()
  const params = useLocalSearchParams()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  // Extract route parameters
  const {
    task,
    fromListItemTab,
    statusLabels,
    forEscalate,
    getTaskCanBeExecuted,
  } = params

  // Parse params data with proper type safety
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)
  const parsedStatusLabels: TaskStatusLabel =
    typeof statusLabels === 'string' && JSON.parse(statusLabels)

  // Store
  const { userSettings, userGroup } = useUserInfoStore()
  const { taskStatuses } = useTaskStore()

  // Enhanced state management
  const [isLoading, setIsLoading] = useState(false)
  const [followUpTask, setFollowUpTask] = useState<any>([])
  const [followUpTaskWidth, setFollowUpTaskWidth] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  // Animation refs for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const headerOpacityAnim = useRef(new Animated.Value(1)).current

  // Computed values and memoized data
  const showSupportedStatusesForStartTask = useMemo(() => {
    const res = userSettings.find(
      (item) => item.key === 'executableTaskStatuses',
    )
    return res?.value ? JSON.parse(res?.value) : ['assigned', 'inProgress']
  }, [userSettings])

  const newButtons = useMemo(() => {
    const getSettingsButtons = userSettings.find(
      (item) => item.key === 'extraDetailsButton',
    )?.value

    return getSettingsButtons ? JSON.parse(getSettingsButtons) : []
  }, [userSettings])

  const getStatusRepInDoneTask = useMemo(() => {
    if (userSettings.length === 0) {
      return
    }
    const res = userSettings.find(
      (item) => item.key === 'statusesRepresentingDoneTask',
    )
    return JSON.parse(res?.value)
  }, [userSettings])

  const showSuppFollowTaskCreation = useMemo(() => {
    const getSettings = userSettings.find(
      (item) => item.key === 'supportFollowUpTaskCreation',
    )
    return getSettings?.value?.toString() === 'true'
  }, [userSettings])

  const creationFormType = useMemo(() => {
    if (userSettings.length === 0) {
      return
    }
    const res = userSettings.find((item) => item.key === 'createFormType')
    const parseRes = JSON.parse(res?.value)
    return parseRes[0]
  }, [userSettings])

  const newTaskDetails = useMemo(() => {
    const data = parsedTask.taskDetails.filter((item: any) => {
      return (
        item.orderMobile != null &&
        item.key !== 'urgentTask' &&
        item.value &&
        item.label
      )
    })
    data.sort((a: any, b: any) => a.orderMobile - b.orderMobile)
    return data
  }, [parsedTask.taskDetails])

  const taskGroupLabel = useMemo(
    () =>
      userGroup.find((group) => group.GroupName === parsedTask.groupName)
        ?.Description ?? parsedTask.groupName,
    [userGroup, parsedTask.groupName],
  )

  // Get actual status color from task store
  const statusTheme = useMemo(() => {
    const statusColor = taskStatuses.find(
      (status) => status.Key === parsedTask?.statusId,
    )?.colorMobile

    if (statusColor) {
      // Use the actual task status color
      return {
        gradient: [statusColor, statusColor],
        bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
        textColor: isDark ? 'text-blue-300' : 'text-blue-800',
        borderColor: 'border-blue-400',
        icon: 'assignment' as const,
      }
    }

    // Fallback to purple theme like other components
    return {
      gradient: isDark ? ['#667EEA', '#764BA2'] : ['#4F46E5', '#7C3AED'],
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      textColor: isDark ? 'text-blue-300' : 'text-blue-800',
      borderColor: 'border-blue-400',
      icon: 'assignment' as const,
    }
  }, [taskStatuses, parsedTask?.statusId, isDark])

  const doneStatuses = useMemo<string[]>(() => {
    const res = userSettings.find(
      (i) => i.key === 'statusesRepresentingDoneTask',
    )
    const raw = res?.value
    if (!raw) return []
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [userSettings])

  // Animation effects
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Status bar styling
  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true)
    }
  }, [isDark])

  // Button animation helpers
  const animateButtonPress = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    if (callback) {
      setTimeout(callback, 150)
    }
  }

  // Enhanced functions with loading states and animations
  const escalateTask = async (item: any) => {
    try {
      const { newStatus } = item
      setIsLoading(true)

      // Show loading animation
      Animated.timing(headerOpacityAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }).start()

      // TODO: Implement actual escalation logic
      // Simulated delay for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // console.log('Escalating task with new status:', newStatus)
    } catch (error) {
      // console.error('Error escalating task:', error)
      Alert.alert('Error', 'Failed to escalate task. Please try again.', [
        { text: 'OK', style: 'default' },
      ])
    } finally {
      setIsLoading(false)

      // Restore header opacity
      Animated.timing(headerOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  const handleEscalation = async (item: any) => {
    animateButtonPress(async () => {
      try {
        await escalateTask(item)
      } catch (error) {
        console.error('Error escalating task:', error)
      }
    })
  }
  const onClickViewButton = async (imageUrl: string) => {
    animateButtonPress()

    if (!imageUrl) {
      Alert.alert('No Document', 'No document is available to view.')
      return
    }

    // TODO: Implement document viewing functionality
    // console.log('Viewing document:', imageUrl)
    Alert.alert(
      'Document Viewer',
      'Document viewing functionality will be implemented here.',
      [{ text: 'OK', style: 'default' }],
    )
  }

  // Modern UI components

  /**
   * Enhanced Task Detail Card Component
   * Features modern card design with glassmorphism effects
   */
  const TaskDetailCard = ({ item, index }: { item: any; index: number }) => {
    const isGroup = item.key === 'groupName'
    const isStatus = item.key === 'statusId'
    const isCurrency = item.inputType === 'currency'
    const isDocument = item.key.startsWith('doc')

    let displayValue = parseValueForRender(item.value, item)

    if (isStatus) {
      displayValue = parsedStatusLabels[item.value]
    }

    if (isGroup) {
      displayValue = taskGroupLabel
    }

    if (isCurrency) {
      displayValue = displayValue
        ? `${DEFAULT_CURRENCY_SYMBOL} ${displayValue}`
        : ''
    }

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className={`mb-3 overflow-hidden rounded-2xl ${
          isDark ? 'bg-gray-800/40' : 'bg-white/80'
        } border backdrop-blur-lg ${
          isDark ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}
      >
        {/* Card header with gradient accent */}
        <View
          className={`h-1 ${isStatus ? statusTheme.bgColor : 'bg-gray-200'}`}
        />

        <View className="p-4">
          <View className="flex-row items-start justify-between">
            {/* Label section */}
            <View className="mr-4 flex-1">
              <Text
                className={`mb-1 text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Text>

              {/* Status badge */}
              {isStatus && (
                <View className={`mt-1 flex-row items-center gap-2`}>
                  <MaterialIcons
                    name={statusTheme.icon}
                    size={16}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                  <View
                    className={`rounded-full px-2 py-1 ${statusTheme.bgColor}`}
                  >
                    <Text
                      className={`text-xs font-medium ${statusTheme.textColor}`}
                    >
                      {displayValue}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Value section */}
            <View className="flex-1">
              {isDocument && item.value ? (
                <TouchableOpacity
                  onPress={() =>
                    onClickViewButton(item.value.value ?? item.value)
                  }
                  className={`flex-row items-center gap-2 rounded-lg px-3 py-2 ${
                    isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}
                >
                  <MaterialIcons name="description" size={20} color="#3B82F6" />
                  <Text
                    className={`font-medium ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    View Document
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  className={`text-right text-base font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } ${isCurrency ? 'font-mono' : ''}`}
                >
                  {typeof displayValue === 'object'
                    ? JSON.stringify(displayValue)
                    : displayValue || 'N/A'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }

  /**
   * Modern Action Button Component
   * Features gradient backgrounds and enhanced press states
   */
  const ActionButton = ({
    title,
    onPress,
    disabled = false,
    variant = 'primary',
    loading = false,
    icon,
  }: {
    title: string
    onPress: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    loading?: boolean
    icon?: string
  }) => {
    const getVariantStyles = () => {
      // Use same gradient as plus button for consistency
      const defaultGradient = isDark
        ? ['#667EEA', '#764BA2']
        : ['#4F46E5', '#7C3AED']

      switch (variant) {
        case 'success':
          return {
            gradient: ['#10B981', '#059669'],
            bgClass: 'bg-green-500',
            disabledClass: 'bg-gray-400',
          }
        case 'warning':
          return {
            gradient: ['#F59E0B', '#D97706'],
            bgClass: 'bg-amber-500',
            disabledClass: 'bg-gray-400',
          }
        case 'danger':
          return {
            gradient: ['#EF4444', '#DC2626'],
            bgClass: 'bg-red-500',
            disabledClass: 'bg-gray-400',
          }
        case 'secondary':
          return {
            gradient: isDark ? ['#374151', '#4B5563'] : ['#F3F4F6', '#E5E7EB'],
            bgClass: isDark ? 'bg-gray-600' : 'bg-gray-200',
            disabledClass: 'bg-gray-400',
          }
        default: // primary - matches plus button
          return {
            gradient: defaultGradient,
            bgClass: 'bg-blue-500',
            disabledClass: 'bg-gray-400',
          }
      }
    }

    const styles = getVariantStyles()

    return (
      <Animated.View
        style={{
          transform: [{ scale: buttonScaleAnim }],
        }}
        className="mb-3"
      >
        <TouchableOpacity
          onPress={() => animateButtonPress(onPress)}
          disabled={disabled || loading}
          className="overflow-hidden rounded-xl"
          style={{
            shadowColor: isDark ? '#667EEA' : '#4F46E5',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={disabled ? ['#9CA3AF', '#6B7280'] : styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 py-3"
          >
            <View className="flex-row items-center justify-center gap-2">
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : icon ? (
                <MaterialIcons name={icon as any} size={18} color="white" />
              ) : null}
              <Text className="text-base font-semibold text-white">
                {loading ? 'Processing...' : title}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  /**
   * Enhanced Task Actions Component
   * Renders different action sets based on task state
   */
  const renderEscalatedTask = () => {
    const ActionsContainer = ({ children }: { children: React.ReactNode }) => (
      <View
        className={`rounded-3xl px-4 py-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/50'} border backdrop-blur-xl ${
          isDark ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}
      >
        <View className="mb-4">
          <Text
            className={`mb-2 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Available Actions
          </Text>
          <Text
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Choose an action to proceed with this task
          </Text>
        </View>
        {children}
      </View>
    )

    switch (forEscalate) {
      case 'escalate':
        return (
          <ActionsContainer>
            {showSupportedStatusesForStartTask.map((item: any, index: any) => {
              return item.includes(parsedTask?.statusId) ? (
                <ActionButton
                  key={index}
                  title={item.label ?? 'Start Task'}
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/task-form',
                      params: { task },
                    })
                  }}
                  disabled={parsedTask?.statusId === 'pending'}
                  loading={isLoading}
                  icon="play-arrow"
                  variant="primary"
                />
              ) : null
            })}
            {newButtons.map((item: any, index: any) => {
              const parseItem =
                typeof item === 'string' ? JSON.parse(item) : item
              return parseItem.statuses.includes(parsedTask?.statusId) ? (
                <ActionButton
                  key={index}
                  title={parseItem.label ?? 'Submit'}
                  onPress={async () => {
                    if (parseItem?.modal) {
                      const modalButtons =
                        typeof parseItem?.modal === 'string'
                          ? JSON.parse(parseItem?.modal)
                          : parseItem?.modal

                      Alert.alert(
                        'Confirm Action',
                        modalButtons?.modalText,
                        modalButtons?.modalButtons.map((items: any) => ({
                          text: items?.label,
                          style:
                            items?.action.toString().toLowerCase() === 'approve'
                              ? 'destructive'
                              : 'default',
                          onPress: () => {
                            if (
                              items?.action.toString().toLowerCase() ===
                              'approve'
                            ) {
                              handleEscalation(parseItem)
                            }
                          },
                        })),
                        { cancelable: true },
                      )
                    } else {
                      await handleEscalation(parseItem)
                    }
                  }}
                  disabled={isLoading}
                  loading={isLoading}
                  icon="send"
                  variant="warning"
                />
              ) : null
            })}
          </ActionsContainer>
        )
      case 'notDone':
        return (
          <ActionsContainer>
            {getTaskCanBeExecuted && (
              <ActionButton
                title="Start Task"
                onPress={() => {
                  router.push({
                    pathname: '/(main)/task-form',
                    params: { task },
                  })
                }}
                disabled={parsedTask?.statusId === 'pending'}
                icon="play-arrow"
                variant="primary"
              />
            )}
          </ActionsContainer>
        )
      case 'done':
        const isDone =
          !!parsedTask?.statusId && doneStatuses.includes(parsedTask.statusId)

        return (
          <ActionsContainer>
            {isDone ? (
              <ActionButton
                title="View Form Details"
                onPress={() => {
                  router.push({
                    pathname: '/(main)/task-info',
                    params: { task },
                  })
                }}
                icon="visibility"
                variant="success"
              />
            ) : (
              <ActionButton
                title="Start Task"
                onPress={() => {
                  router.push({
                    pathname: '/(main)/task-form',
                    params: { task },
                  })
                }}
                disabled={parsedTask?.statusId === 'pending'}
                icon="play-arrow"
                variant="primary"
              />
            )}

            {showSuppFollowTaskCreation &&
              getStatusRepInDoneTask.includes(parsedTask?.statusId) && (
                <ActionButton
                  title="Create Follow-Up Task"
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/task-form',
                      params: {
                        task: JSON.stringify(followUpTask),
                        followUpTask: 1,
                        creationFormType,
                      },
                    })
                  }}
                  icon="add-task"
                  variant="secondary"
                />
              )}
          </ActionsContainer>
        )
      default:
        return (
          <ActionsContainer>
            {showSupportedStatusesForStartTask.map((item: any, index: any) => {
              return item.includes(parsedTask?.statusId) ? (
                <ActionButton
                  key={index}
                  title="Start Task"
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/task-form',
                      params: { task },
                    })
                  }}
                  disabled={parsedTask?.statusId === 'pending'}
                  icon="play-arrow"
                  variant="primary"
                />
              ) : null
            })}
            {newButtons.map((item: any, index: number) => {
              const parseItem =
                typeof item === 'string' ? JSON.parse(item) : item
              return parseItem.statuses.includes(parsedTask?.statusId) ? (
                <ActionButton
                  key={index}
                  title={parseItem.label ?? 'Submit'}
                  onPress={async () => {
                    if (parseItem?.modal) {
                      const modalButtons =
                        typeof parseItem?.modal === 'string'
                          ? JSON.parse(parseItem?.modal)
                          : parseItem?.modal

                      Alert.alert(
                        'Confirm Action',
                        modalButtons?.modalText,
                        modalButtons?.modalButtons.map((items: any) => ({
                          text: items?.label,
                          style:
                            items?.action.toString().toLowerCase() === 'approve'
                              ? 'destructive'
                              : 'default',
                          onPress: () => {
                            if (
                              items?.action.toString().toLowerCase() ===
                              'approve'
                            ) {
                              handleEscalation(parseItem)
                            }
                          },
                        })),
                        { cancelable: true },
                      )
                    } else {
                      await handleEscalation(parseItem)
                    }
                  }}
                  disabled={isLoading}
                  loading={isLoading}
                  icon="send"
                  variant="warning"
                />
              ) : null
            })}
          </ActionsContainer>
        )
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Background Gradient - Same as tasks page */}
      <LinearGradient
        colors={
          isDark
            ? ['#1a1a2e', '#16213e', '#0f3460']
            : ['#ffffff', '#f8faff', '#e8f4f8']
        }
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Status bar configuration */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ParallaxScrollView
        headerBackgroundColor={{
          light: 'transparent',
          dark: 'transparent',
        }}
        headerContent={
          <Animated.View
            style={{
              opacity: headerOpacityAnim,
            }}
            className="relative overflow-hidden"
          >
            {/* Dynamic gradient background based on status */}
            <LinearGradient
              colors={statusTheme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0"
            />

            {/* Glassmorphism overlay */}
            <View
              className="absolute inset-0"
              style={{
                backgroundColor: isDark
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            />

            {/* Decorative elements */}
            <View
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: [{ scale: 0.5 }],
              }}
            />
            <View
              className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full opacity-20"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: [{ scale: 0.3 }],
              }}
            />

            <View className="p-6 pb-8">
              {/* Back button with enhanced styling */}
              <View className="mb-6">
                <TouchableOpacity
                  className="flex-row items-center gap-3"
                  onPress={() => router.back()}
                >
                  <View className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-white">
                      Task Details
                    </Text>
                    <Text className="text-sm text-white/80">
                      {parsedTask.taskType} #{parsedTask.taskId}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Status indicator header */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-2 flex-row items-center gap-3">
                    <MaterialIcons
                      name={statusTheme.icon}
                      size={28}
                      color="white"
                    />
                    <Text className="text-2xl font-bold text-white">
                      {parsedStatusLabels[parsedTask.statusId] ||
                        parsedTask.statusId}
                    </Text>
                  </View>
                  <Text className="text-base text-white/90">
                    {taskGroupLabel}
                  </Text>
                </View>

                {/* Urgent task indicator */}
                {!!parsedTask.urgentTask && (
                  <View className="rounded-full bg-red-500/90 p-3 backdrop-blur-sm">
                    <MaterialCommunityIcons
                      name="flash"
                      size={24}
                      color="white"
                    />
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        }
      >
        {/* Main content container with enhanced styling */}
        <View
          className="flex-1 px-4 py-6"
          style={{ backgroundColor: 'transparent' }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <View className="absolute inset-0 z-50 flex-1 items-center justify-center">
              <BlurView
                intensity={20}
                className="w-full flex-1 items-center justify-center"
              >
                <View
                  className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl`}
                >
                  <ActivityIndicator
                    size="large"
                    color={statusTheme.gradient[0]}
                  />
                  <Text
                    className={`mt-4 text-center text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Processing...
                  </Text>
                </View>
              </BlurView>
            </View>
          )}

          {/* Task details section */}
          <View className="mb-8">
            <View className="mb-6">
              <Text
                className={`mb-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Task Information
              </Text>
              <Text
                className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Detailed information about this task
              </Text>
            </View>

            {/* Task detail cards */}
            <View className="space-y-3">
              {newTaskDetails.map((item: any, index: number) => (
                <TaskDetailCard key={index} item={item} index={index} />
              ))}
            </View>
          </View>

          {/* Actions section */}
          <View className="mb-8">{renderEscalatedTask()}</View>

          {/* Footer information */}
          <View
            className={`mt-8 rounded-2xl p-4 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} border backdrop-blur-xl ${
              isDark ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Last Updated
                </Text>
                <Text
                  className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {new Date(parsedTask.lastUpdatedAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Assigned To
                </Text>
                <Text
                  className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {typeof parsedTask.assignedTo === 'object'
                    ? parsedTask.assignedTo?.agentName ||
                      parsedTask.assignedTo?.name ||
                      'Unassigned'
                    : parsedTask.assignedTo || 'Unassigned'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ParallaxScrollView>

      {/* Custom Bottom Navigation */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View
          className={`mx-auto w-full max-w-sm overflow-hidden rounded-3xl px-2 ${
            isDark ? 'bg-gray-900/80' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <BlurView
            intensity={25}
            tint={isDark ? 'dark' : 'light'}
            className="absolute inset-0"
          />
          <View className="relative h-16 flex-row">
            {/* Settings Tab */}
            <TouchableOpacity
              className="flex-1 items-center justify-center"
              onPress={() => router.push('/(main)/(tabs)/settings')}
            >
              <MaterialIcons
                name="settings"
                size={24}
                color={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </TouchableOpacity>

            {/* Tasks Tab - Highlighted since we came from tasks */}
            <TouchableOpacity
              className="flex-1 items-center justify-center"
              onPress={() => router.push('/(main)/(tabs)/tasks')}
            >
              <View className="items-center">
                <MaterialIcons
                  name="menu"
                  size={24}
                  color={isDark ? '#667EEA' : '#4F46E5'}
                />
              </View>
            </TouchableOpacity>

            {/* Home Tab */}
            <TouchableOpacity
              className="flex-1 items-center justify-center"
              onPress={() => router.push('/(main)/(tabs)/home')}
            >
              <MaterialIcons
                name="home"
                size={24}
                color={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default TaskDetail
