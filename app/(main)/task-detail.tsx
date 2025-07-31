import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const TaskDetail = () => {
  const params = useLocalSearchParams()
  console.log('params', params)
  return (
    <ParallaxScrollView>
      <BackButton title="Task Detail" />
      <View>
        <Text>TaskDetail</Text>
      </View>
    </ParallaxScrollView>
  )
}

export default TaskDetail
