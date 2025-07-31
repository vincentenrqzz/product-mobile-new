import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/constants'
import parseValueForRender from '@/lib/parseValueForRenderer'
import removeUrgentFromDetails from '@/lib/removeUrgentFromDetails'
import useTaskStore, { Task } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { cloneDeep } from 'lodash'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
interface Props {
  task: Task
}
const TaskItemKey = ({ task }: Props) => {
  const { userSettings, userGroup } = useUserInfoStore()
  const { taskStatuses } = useTaskStore()
  //memo
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

  const taskDetailsDisplayLimit = useMemo(() => {
    const match = userSettings.find(
      (item) => item.key === 'mobileTaskDetailsNumber',
    )
    return sortedDetails.slice(0, match?.value ?? 5)
  }, [userSettings])

  const statusLabels = useMemo(() => {
    return taskStatuses.reduce((acc: any, item) => {
      acc[item.Key] = item.label
      return acc
    }, {})
  }, [taskStatuses])

  const currency = useMemo(() => {
    const match = userSettings.find(
      (item) => item.key === 'defaultCurrencyType',
    )

    return match?.value ?? DEFAULT_CURRENCY_SYMBOL
  }, [userSettings])

  const taskGroupLabel =
    userGroup.find((group) => group.GroupName === task.groupName)
      ?.Description ?? task.groupName

  return (
    <View>
      {taskDetailsDisplayLimit.map((item: any) => {
        const isGroup = item.key === 'groupName'
        let value = item.value

        if (item.key === 'statusId' && statusLabels != null) {
          if (task.statusId === 'Pending') {
            value = task.statusId
          } else {
            value = statusLabels[item.value]
          }
        }

        let parsedValue = parseValueForRender(value, item)
        const isCurrency = item.inputType === 'currency'

        if (isCurrency) {
          parsedValue = parsedValue
            ? `${currency ?? DEFAULT_CURRENCY_SYMBOL} ${parsedValue}`
            : ''
        }

        if (isGroup) {
          parsedValue = taskGroupLabel
        }

        return (
          <View className="flex flex-row justify-between" key={item.key}>
            <Text style={{}}>{item.label}:</Text>
            <Text style={{}}>{parsedValue}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default TaskItemKey
