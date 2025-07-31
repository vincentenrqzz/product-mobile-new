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
import { Alert, Linking, Platform, TouchableOpacity, View } from 'react-native'
import TaskItemKey from './TaskItemKey'
interface Props {
  task: Task
  forEscalate: string
  backgroundColor: string
}
const TaskItem = ({ task, forEscalate, backgroundColor }: Props) => {
  //builtin
  const router = useRouter()

  //store
  const { userSettings, userInfo } = useUserInfoStore()
  const { taskList, taskStatuses } = useTaskStore()
  const { dialerClicks, setDialerClicks } = useFormsStore()

  //state
  const [isEqualTask, setIsEqualTask] = useState<number | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)

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
  const toListItemDetails = sortedDetails.slice(5, sortedDetails.length)
  return (
    <TouchableOpacity
      className="my-4"
      disabled={forEscalate === 'pending'}
      onPress={() => {
        router.push({
          pathname: '/(main)/task-detail',
          params: {
            task,
            fromListItemTab: toListItemDetails,
            statusLabels,
          },
        })
        // if (task.statusId === 'pending') {
        //   // router.push('/(main)/task-detail', {
        //   //   task,
        //   //   fromListItemTab: toListItemDetails,
        //   //   statusLabels,
        //   // })

        // }
      }}
    >
      <View
        style={[{ backgroundColor: backgroundColor }]}
        className="rounded-md p-4"
      >
        <View
          className="flex-row"
          style={{
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: '60%' }}>
            <TaskItemKey task={task} sortedDetails={sortedDetails} />
          </View>

          <View className="gap-2">
            {!getTaskCanBeExecuted && isEqualTask === task?.taskId && (
              <View className="jutify-center items-center">
                <MaterialCommunityIcons
                  name="alert-outline"
                  color="#000"
                  size={28}
                />
              </View>
            )}
            {isUrgent && (
              <View className="jutify-center items-center">
                <MaterialCommunityIcons name="flash" size={28} color="red" />
              </View>
            )}
            {contactNumber !== '' && (
              <TouchableOpacity
                className="jutify-center items-center"
                onPress={() => openContacts(contactNumber)}
              >
                <MaterialCommunityIcons name="phone" size={28} />
              </TouchableOpacity>
            )}
            {addressDetails !== '' && (
              <TouchableOpacity
                className="jutify-center items-center"
                onPress={() => openMap(addressDetails)}
              >
                <View>
                  <MaterialCommunityIcons name="navigation" size={28} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TaskItem
