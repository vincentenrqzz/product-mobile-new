import countTasksForDay from '@/lib/countTaskForDay'
import toIsraelTime from '@/lib/toIsraelTime'
import useTaskStore, { Task } from '@/store/tasks'
import React, { useMemo } from 'react'
import { FlatList, Text, View } from 'react-native'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  dateSeparator: boolean
  forEscalate: string
}

const TaskList = ({ tasks, dateSeparator, forEscalate }: Props) => {
  //store
  const { taskStatuses } = useTaskStore()

  //memo
  const statusColors = useMemo(() => {
    return taskStatuses.reduce(
      (res: any, item: { Key: any; colorMobile: any }) => {
        return { ...res, [item.Key]: item.colorMobile }
      },
      {},
    )
  }, [taskStatuses])

  //component
  const renderItem = ({ item, index }: { item: Task; index: number }) => {
    const israelTime = toIsraelTime(item.executionEndDate)
    const getCurrItemDate = israelTime.format('DD.M.YY')
    const getPrevItemDate =
      index > 0
        ? toIsraelTime(tasks[index - 1].executionEndDate).format('DD.M.YY')
        : null

    const getCurrentDay = israelTime.format('dddd')
    const taskCount = countTasksForDay(item.executionEndDate, tasks)

    const sameDate = getPrevItemDate === getCurrItemDate
    const backgroundColor =
      forEscalate === 'pending' ? 'white' : statusColors[item.statusId]

    return (
      <>
        {dateSeparator && !sameDate && (
          <View
            style={{
              flexDirection: 'row', // Arrange the elements in a row
              alignItems: 'center', // Vertically center the content
              justifyContent: 'center', // Horizontally center the entire content
              marginBottom: 5, // Spacing above and below
              paddingHorizontal: 15, // Add padding to make space for the lines
            }}
          >
            <View
              style={{
                flex: 1, // The line will expand to fill available space
                height: 0.8, // Thin line height
                backgroundColor: 'gray', // Line color (black)
                marginHorizontal: 5, // Space between the date and the lines
              }}
            />
            <Text
              style={{
                textAlign: 'center', // Center-align the text
              }}
            >
              {`${getCurrentDay.toLowerCase()}`} {getCurrItemDate}
              {`(${taskCount})`}
            </Text>
            <View
              style={{
                flex: 1, // The line will expand to fill available space
                height: 0.8, // Thin line height
                backgroundColor: 'gray', // Line color (black)
                marginHorizontal: 5, // Space between the date and the lines
              }}
            />
          </View>
        )}

        <TaskItem
          task={item}
          forEscalate={forEscalate}
          backgroundColor={backgroundColor}
        />
      </>
    )
  }
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.taskId.toString()}
      contentContainerStyle={{ flexGrow: 1 }}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      removeClippedSubviews={true}
    />
  )
}

export default TaskList
