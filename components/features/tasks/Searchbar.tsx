import { useAppTheme } from '@/hooks/useAppTheme'
import { Ionicons } from '@expo/vector-icons'
import React, { PropsWithChildren, useState } from 'react'
import { TouchableOpacity, useColorScheme, View } from 'react-native'
import InputField from '../../ui/InputField'
import DatePickerModal from './DatePickerModal'

type Props = PropsWithChildren<{
  searchbarBackgroundColor?: { dark: string; light: string }
  value: string // The search text
  onChangeText: React.Dispatch<React.SetStateAction<string>>
  setTimeNow: React.Dispatch<React.SetStateAction<Date>>
  onRefreshTasks: (isManual?: boolean) => Promise<void>
}>

const Searchbar = ({
  searchbarBackgroundColor,
  value,
  onChangeText,
  setTimeNow,
  onRefreshTasks,
}: Props) => {
  const { colors } = useAppTheme()
  const colorScheme = useColorScheme() ?? 'light'
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

  return (
    <View className="flex flex-row  gap-4">
      {/* Input Field with 70% width */}
      <View style={{ flex: 1 }}>
        <InputField
          style={{
            borderRadius: 50,
            backgroundColor:
              searchbarBackgroundColor && searchbarBackgroundColor[colorScheme],
          }}
          leftElement={
            <Ionicons name="search-outline" size={20} color={colors.dark} />
          }
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {/* Left elements (Icons) */}
      <View className="flex-row items-center gap-8 ">
        <TouchableOpacity
          onPress={() => {
            setIsDatePickerVisible(true)
          }}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onRefreshTasks()
          }}
        >
          <Ionicons name="reload" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>
      <DatePickerModal
        setTimeNow={setTimeNow}
        isDatePickerVisible={isDatePickerVisible}
        setIsDatePickerVisible={setIsDatePickerVisible}
      />
    </View>
  )
}

export default Searchbar
