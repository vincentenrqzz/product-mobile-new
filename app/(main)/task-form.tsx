import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { Task } from '@/store/tasks'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'

const TaskForm = () => {
  //builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task, fromListItemTab, statusLabels } = params

  //parsing params data
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)

  return (
    <ParallaxScrollView>
      <BackButton title="Task Forms" />

      <Text>TaskForm</Text>
    </ParallaxScrollView>
  )
}

export default TaskForm
