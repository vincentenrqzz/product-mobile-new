import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { Task } from '@/types/task'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const TaskDetail = () => {
  //builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task, fromListItemTab, statusLabels } = params

  //parsing params data
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)

  return (
    <ParallaxScrollView>
      <BackButton title={`${parsedTask.taskType}`} />
      <View>
        <Text>TaskDetail</Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/(main)/task-form',
              params: {
                task,
              },
            })
          }}
        >
          <Text>Go forms</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  )
}

export default TaskDetail
