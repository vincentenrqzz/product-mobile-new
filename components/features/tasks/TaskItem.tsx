import getCoordinatesFromAddress from '@/lib/getCoordinates'
import openWazeAppStore from '@/lib/openWazeAppStore'
import removeUrgentFromDetails from '@/lib/removeUrgentFromDetails'
import useFormsStore from '@/store/forms'
import useTaskStore, { Task } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { cloneDeep } from 'lodash'
import moment from 'moment-timezone'
import React, { useMemo, useState } from 'react'
import { 
  Alert, 
  Linking, 
  Platform, 
  TouchableOpacity, 
  View,
  StyleSheet
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn
} from 'react-native-reanimated'
import { useAppTheme } from '@/hooks/useAppTheme'
import TaskItemKey from './TaskItemKey'
interface Props {
  task: Task
  forEscalate: string
  backgroundColor: string
}
/**
 * Modern TaskItem Component
 * Features: Enhanced card design, smooth animations, improved visual hierarchy
 */
const TaskItem = ({ task, forEscalate, backgroundColor }: Props) => {
  //builtin
  const router = useRouter()
  const { colors, isDark } = useAppTheme()

  //store
  const { userSettings, userInfo } = useUserInfoStore()
  const { taskList, taskStatuses } = useTaskStore()
  const { dialerClicks, setDialerClicks } = useFormsStore()

  //state
  const [isEqualTask, setIsEqualTask] = useState<number | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)
  
  // Animation values
  const cardScale = useSharedValue(1)
  const phoneButtonScale = useSharedValue(1)
  const mapButtonScale = useSharedValue(1)

  //memo
  const getTaskCanBeExecuted = useMemo(() => {
    const res = userSettings.find((item) => item.key === 'anyTaskCanBeExecuted')
    const parsedItem = res ? JSON.parse(res.value) : true

    return parsedItem
  }, [userSettings])

  const contactNumber: string = useMemo(() => {
    const { taskDetails } = task

    if (!taskDetails) return ''

    const phoneNumberDetail = taskDetails.find(
      (item: any) => item.key === taskList?.taskDetailsIcons?.phoneIcon,
    )

    return phoneNumberDetail?.value ?? ''
  }, [task, taskList?.taskDetailsIcons])

  const isEnableDialerClicks = useMemo(() => {
    const dialerClicks = userSettings.find(
      (item) => item.key === 'countDialerClicks',
    )

    return dialerClicks?.value ?? false
  }, [userSettings])

  const addressDetails = useMemo(() => {
    let mapIconKeys = taskList?.taskDetailsIcons?.mapIcon
    if (!mapIconKeys) return ''

    const { taskDetails } = task
    if (!taskDetails) return ''

    const detailsMap = taskDetails.reduce((acc: any, item: any) => {
      acc[item.key] = item
      return acc
    }, {})

    if (typeof mapIconKeys === 'string') {
      mapIconKeys = mapIconKeys.split(',')
    }
    if (Array.isArray(mapIconKeys)) {
      const res = mapIconKeys
        .map((item) => detailsMap[item]?.value)
        .filter(Boolean)
        .join(', ')
      return res
    }

    return ''
  }, [task, taskList?.taskDetailsIcons])

  const statusLabels = useMemo(() => {
    return taskStatuses.reduce((acc: any, item) => {
      acc[item.Key] = item.label
      return acc
    }, {})
  }, [taskStatuses])
  const sortedDetails = useMemo(() => {
    const { taskDetails } = task

    if (!taskDetails) return []

    let clone = cloneDeep(taskDetails)
    clone = removeUrgentFromDetails(clone)

    clone.sort((a: any, b: any) => {
      if (a.orderMobile === b.orderMobile) return a.label.localeCompare(b.label)
      if (a.orderMobile == null && b.orderMobile == null) return 0

      if (a.orderMobile == null) return 1
      if (b.orderMobile == null) return -1

      return a.orderMobile < b.orderMobile ? -1 : 1
    })

    return clone
  }, [task])

  //function
  const registerClickDates = async (task: any) => {
    try {
      const tenant = userInfo?.tenant
      if (!tenant) return

      const { taskId } = task
      const currentTimestamp = moment().format('YYYY-MM-DD HH:mm')

      let updatedClicks = []

      if (dialerClicks) {
        const existingTask = dialerClicks.find(
          (item: any) => item.taskId === taskId,
        )

        if (existingTask) {
          const uniqueTimestamps = new Set(existingTask.dialerClicks.split(';'))
          uniqueTimestamps.add(currentTimestamp)

          existingTask.dialerClicks = Array.from(uniqueTimestamps).join(';')
        } else {
          dialerClicks.push({ taskId, dialerClicks: currentTimestamp })
        }

        updatedClicks = dialerClicks
      } else {
        updatedClicks = [{ taskId, dialerClicks: currentTimestamp }]
      }

      setDialerClicks(updatedClicks)
    } catch (error) {
      console.error('Error registering dates:', error)
    }
  }

  const openContacts = (phoneNumber: string) => {
    if (phoneNumber != null && phoneNumber.trim()) {
      if (isEnableDialerClicks && forEscalate !== 'done') {
        registerClickDates(task)
      }
      Linking.openURL(`tel:${phoneNumber}`)
    } else {
      Alert.alert(
        '',
        `${'noContactNo'}`,
        [{ text: 'ok', onPress: () => console.log('OK Pressed') }],
        { cancelable: true },
      )
    }
  }

  const openMap = async (address: string) => {
    if (address.trim() === '') {
      Alert.alert(
        '',
        `${'noMap'}`,
        [{ text: 'ok', onPress: () => console.log('OK Pressed') }],
        { cancelable: true },
      )
      return
    }

    const isIOS = Platform.OS === 'ios'

    if (isIOS) {
      const encodedTitle = encodeURIComponent(address)
      const { latitude, longitude } = await getCoordinatesFromAddress(address)
      const latlng = `${latitude},${longitude}`
      const wazeUrl = `waze://?ll=${latlng}&navigate=yes&q=${encodedTitle}`
      Linking.openURL(wazeUrl).catch(() => {
        isIOS && openWazeAppStore()
      })
      return
    }

    const mapsUrl = `geo:0,0?q=${address}`
    Linking.openURL(mapsUrl).catch(() => {})
  }

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }]
  }))

  const phoneButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: phoneButtonScale.value }]
  }))

  const mapButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mapButtonScale.value }]
  }))

  // Animation handlers
  const handleCardPressIn = () => {
    cardScale.value = withSpring(0.98)
  }

  const handleCardPressOut = () => {
    cardScale.value = withSpring(1)
  }

  const handlePhonePress = () => {
    phoneButtonScale.value = withSequence(
      withSpring(0.8),
      withSpring(1.1),
      withSpring(1)
    )
    openContacts(contactNumber)
  }

  const handleMapPress = () => {
    mapButtonScale.value = withSequence(
      withSpring(0.8),
      withSpring(1.1),
      withSpring(1)
    )
    openMap(addressDetails)
  }

  // Enhanced text color calculation with better color handling
  const getContrastTextColor = (bgColor: string) => {
    if (!bgColor || bgColor === 'white') {
      return isDark ? '#FFFFFF' : '#1F2937'
    }
    
    // Handle different color formats
    let hex = bgColor
    if (bgColor.startsWith('#')) {
      hex = bgColor.slice(1)
    } else if (bgColor.startsWith('rgb')) {
      // Convert rgb to hex first
      const rgbMatch = bgColor.match(/\d+/g)
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number)
        hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
      }
    }
    
    // Ensure 6-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }
    
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calculate luminance using proper formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Use softer contrast - not pure black/white
    if (luminance > 0.6) {
      return '#1F2937' // Dark gray instead of pure black
    } else if (luminance > 0.4) {
      return '#374151' // Medium dark for medium colors
    } else {
      return '#F9FAFB' // Off-white instead of pure white
    }
  }

  const dynamicTextColor = getContrastTextColor(backgroundColor)
  const toListItemDetails = sortedDetails.slice(5, sortedDetails.length)
  
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Animated.View style={cardAnimatedStyle}>
        <TouchableOpacity
          disabled={forEscalate === 'pending'}
          onPressIn={handleCardPressIn}
          onPressOut={handleCardPressOut}
          onPress={() => {
            router.push({
              pathname: '/(main)/task-detail',
              params: {
                task: JSON.stringify(task),
                statusLabels: JSON.stringify(statusLabels),
                forEscalate,
                getTaskCanBeExecuted,
              },
            })
          }}
          activeOpacity={0.95}
        >
        {/* Modern Card Container */}
        <View style={styles.cardContainer}>
          {/* Background with Status Color */}
          <View
            style={[
              styles.cardBackground,
              {
                backgroundColor: backgroundColor && backgroundColor !== 'white'
                  ? backgroundColor
                  : isDark
                    ? '#1F2937'
                    : '#FFFFFF'
              }
            ]}
          />
          

          {/* Main Content */}
          <View style={styles.cardContent}>
            {/* Left Content - Task Details */}
            <View style={styles.taskDetails}>
              <TaskItemKey 
                task={task} 
                sortedDetails={sortedDetails} 
                textColor={dynamicTextColor}
              />
            </View>

            {/* Right Content - Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {/* Alert Icon */}
              {!getTaskCanBeExecuted && isEqualTask === task?.taskId && (
                <View style={styles.statusIconContainer}>
                  <LinearGradient
                    colors={['#FEF3C7', '#FDE047']}
                    style={styles.statusIconBackground}
                  >
                    <MaterialCommunityIcons
                      name="alert-outline"
                      color="#D97706"
                      size={20}
                    />
                  </LinearGradient>
                </View>
              )}

              {/* Urgent Icon */}
              {isUrgent && (
                <View style={styles.statusIconContainer}>
                  <LinearGradient
                    colors={['#FEE2E2', '#FECACA']}
                    style={styles.statusIconBackground}
                  >
                    <MaterialCommunityIcons 
                      name="flash" 
                      size={20} 
                      color="#DC2626" 
                    />
                  </LinearGradient>
                </View>
              )}

              {/* Phone Button */}
              {contactNumber !== '' && (
                <Animated.View style={phoneButtonAnimatedStyle}>
                  <TouchableOpacity
                    onPress={handlePhonePress}
                    style={styles.actionButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isDark
                          ? ['rgba(34, 197, 94, 0.2)', 'rgba(22, 163, 74, 0.2)']
                          : ['rgba(34, 197, 94, 0.1)', 'rgba(22, 163, 74, 0.1)']
                      }
                      style={styles.actionButtonBackground}
                    >
                      <MaterialCommunityIcons 
                        name="phone" 
                        size={16} 
                        color={isDark ? '#4ADE80' : '#22C55E'} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Map Button */}
              {addressDetails !== '' && (
                <Animated.View style={mapButtonAnimatedStyle}>
                  <TouchableOpacity
                    onPress={handleMapPress}
                    style={styles.actionButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isDark
                          ? ['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.2)']
                          : ['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']
                      }
                      style={styles.actionButtonBackground}
                    >
                      <MaterialCommunityIcons 
                        name="navigation" 
                        size={16} 
                        color={isDark ? '#60A5FA' : '#3B82F6'} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

// Modern Styles
const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginVertical: 2,
    marginHorizontal: 12,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  taskDetails: {
    flex: 1,
    paddingRight: 16,
  },
  actionButtonsContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    minWidth: 48,
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statusIconBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
})

export default TaskItem
