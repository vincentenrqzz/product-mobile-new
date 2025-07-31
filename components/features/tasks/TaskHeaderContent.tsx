import AppLogo from '@/components/ui/AppLogo'
import { AntDesign } from '@expo/vector-icons'
import 'moment/locale/en-gb'
import 'moment/locale/he'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface TaskHeaderContentProps {
  timeNow: string
  matchLogo: any
  onRefreshTasks: () => void
  setTimeNow: React.Dispatch<React.SetStateAction<string | Date>>
}

const TaskHeaderContent: React.FC<TaskHeaderContentProps> = ({
  timeNow,
  matchLogo,
  setTimeNow,
  onRefreshTasks,
}) => {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <AppLogo />
          <Text>{timeNow}</Text>
        </View>
        <TouchableOpacity className="flex-row items-center gap-4 pr-4">
          <AntDesign name="pluscircle" size={32} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TaskHeaderContent
