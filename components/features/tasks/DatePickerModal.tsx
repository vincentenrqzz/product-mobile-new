import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useAppTheme } from '@/hooks/useAppTheme'

interface DatePickerModalProps {
  isDatePickerVisible: boolean // Controls the visibility of the modal
  //   timeNow: Date // The currently selected date (initial value)
  setTimeNow: (date: Date) => void // Function to update the selected date
  setIsDatePickerVisible: (visible: boolean) => void // Function to update the visibility of the modal
}

/**
 * Modern DatePickerModal Component
 * Features: Enhanced styling, theme support, improved UX
 */
const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isDatePickerVisible,
  setTimeNow,
  setIsDatePickerVisible,
}) => {
  const { colors, isDark } = useAppTheme()

  const handleConfirm = (date: Date) => {
    setTimeNow(date)
    hideDatePicker()
  }

  const hideDatePicker = () => {
    setIsDatePickerVisible(false)
  }

  return (
    <DateTimePickerModal
      isVisible={isDatePickerVisible}
      mode="date"
      locale={'en'}
      onConfirm={handleConfirm}
      onCancel={hideDatePicker}
      cancelTextIOS={'Cancel'}
      confirmTextIOS={'Confirm'}
      // Modern styling props
      accentColor={isDark ? '#667EEA' : '#4F46E5'}
      backgroundColor={isDark ? '#1a1a2e' : '#ffffff'}
      textColor={isDark ? colors.text : '#2D3748'}
      // Enhanced button styling
      buttonTextColorIOS={isDark ? '#667EEA' : '#4F46E5'}
      // Modal styling
      modalStyleIOS={{
        borderRadius: 20,
        backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: isDark ? 0.3 : 0.25,
        shadowRadius: 20,
        elevation: 10,
      }}
      // Picker styling
      pickerStyleIOS={{
        borderRadius: 16,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(248, 250, 255, 0.8)',
      }}
    />
  )
}

const styles = StyleSheet.create({})

export default DatePickerModal
