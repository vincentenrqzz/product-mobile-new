import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/constants'
import parseValueForRender from '@/lib/parseValueForRenderer'
import useTaskStore, { Task, TaskDetail } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import React, { useMemo } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { useAppTheme } from '@/hooks/useAppTheme'
import Animated, { FadeInLeft } from 'react-native-reanimated'
interface Props {
  task: Task
  sortedDetails: TaskDetail[]
  textColor?: string
}
/**
 * Modern TaskItemKey Component
 * Features: Enhanced typography, improved layout, consistent styling
 */
const TaskItemKey = ({ task, sortedDetails, textColor }: Props) => {
  const { userSettings, userGroup } = useUserInfoStore()
  const { taskStatuses } = useTaskStore()
  const { colors, isDark } = useAppTheme()
  
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
    <View style={styles.container}>
      {taskDetailsDisplayLimit.map((item: any, index) => {
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
          <View key={item.key} style={styles.detailRow}>
            <Text style={[
              styles.labelText,
              { 
                color: textColor 
                  ? textColor === '#F9FAFB' ? 'rgba(249, 250, 251, 0.8)' : 
                    textColor === '#374151' ? 'rgba(55, 65, 81, 0.8)' :
                    'rgba(31, 41, 55, 0.8)'
                  : (isDark ? '#A0AEC0' : '#718096')
              }
            ]}>
              {item.label}:
            </Text>
            <Text 
              numberOfLines={2}
              style={[
                styles.valueText,
                { 
                  color: textColor || (isDark ? colors.text : '#2D3748'),
                  fontWeight: '700'
                }
              ]}
            >
              {parsedValue}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

// Modern Styles
const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    minHeight: 20,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
    width: 90,
    flexShrink: 0,
    textAlign: 'left',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: 16,
    textAlign: 'left',
  },
})

export default TaskItemKey
