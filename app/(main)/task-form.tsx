import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import React from 'react'
import { Text } from 'react-native'

const TaskForm = () => {
  return (
    <ParallaxScrollView>
      <BackButton title="Task Forms" />

      <Text>TaskForm</Text>
    </ParallaxScrollView>
  )
}

export default TaskForm
