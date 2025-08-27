import countTasksForDay from '@/lib/countTaskForDay'
import toIsraelTime from '@/lib/toIsraelTime'
import useTaskStore, { Task } from '@/store/tasks'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { FlatList, Text, View } from 'react-native'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  dateSeparator: boolean
  forEscalate: string
  onRefetchTask: () => void
  isRefresh: boolean
}

const TaskList = ({
  tasks,
  dateSeparator,
  forEscalate,
  onRefetchTask,
  isRefresh,
}: Props) => {
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

  const renderEmptyComponent = () => {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <MaterialCommunityIcons
          name="clipboard-text-multiple-outline"
          size={80}
        />

        <View className=" items-center justify-center gap-2">
          <Text className="text-lg font-bold">No Task yet.</Text>
          <Text className="text-center text-lg font-semibold">
            You’re all caught up. Add your first task to get started.
          </Text>
        </View>
      </View>
    )
  }
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={tasks}
      keyExtractor={(item) => item.taskId.toString()}
      contentContainerStyle={{ flexGrow: 1 }}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      removeClippedSubviews={true}
      ListEmptyComponent={renderEmptyComponent}
      onRefresh={onRefetchTask}
      refreshing={isRefresh}
    />
  )
}

export default TaskList
