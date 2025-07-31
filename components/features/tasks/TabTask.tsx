import useUserInfoStore from '@/store/userInfo'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface TabTaskProps {
  statusesTabs: { [key: string]: any[] } // A map of statuses to tasks (the structure is not clear from the code)
  setActiveTab: (tab: string) => void // A function to update the active tab
  activeTab: string // The current active tab
}

const TabTask: React.FC<TabTaskProps> = ({
  statusesTabs,
  setActiveTab,
  activeTab,
}) => {
  const { userSettings } = useUserInfoStore()
  const [labels, setLabels] = useState<any>({})

  const showEscalateTab = useMemo(() => {
    const match = userSettings.find((item) => item.key === 'showEscalateTab')
    return match?.value?.toString() === 'true'
  }, [userSettings])

  useEffect(() => {
    const match = userSettings.find((item) => item.key === 'mobileTabLabels')

    if (match?.value) {
      const parseLabels = JSON.parse(match?.value?.toString())
      if (parseLabels) {
        setLabels(parseLabels)
      } else {
        setLabels({})
      }
    } else {
      setLabels({})
    }
  }, [userSettings])

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-4">
        {Object.keys(statusesTabs).map((key) => {
          const escalateTab = key === 'escalate'

          if (escalateTab && !showEscalateTab) {
            return null
          }

          const label = labels[key] || key
          const isActive = activeTab === key
          const textColor = isActive ? 'text-blue-600' : 'text-gray-900' // Active tab text in blue

          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              className={`mx-4 items-center justify-center px-5 py-2 ${
                isActive
                  ? 'border-b-4 border-blue-600'
                  : 'border-b-4 border-transparent'
              }`}
            >
              <Text className={`${textColor} text-lg font-medium`}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default TabTask
