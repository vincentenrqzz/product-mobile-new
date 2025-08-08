import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/constants'
import parseValueForRender from '@/lib/parseValueForRenderer'
import useTaskStore, { Task, TaskDetail } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
interface Props {
  task: Task
  sortedDetails: TaskDetail[]
}
const TaskItemKey = ({ task, sortedDetails }: Props) => {
  const { userSettings, userGroup } = useUserInfoStore()
  const { taskStatuses } = useTaskStore()
  //memo

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
    <View className="gap-2">
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
          <View className="flex-row  gap-8" key={item.key}>
            <Text style={{}}>{item.label}:</Text>
            <Text numberOfLines={2}>{parsedValue}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default TaskItemKey
