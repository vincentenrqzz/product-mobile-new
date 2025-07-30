import React from 'react'
import { StyleSheet } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

interface DatePickerModalProps {
  isDatePickerVisible: boolean // Controls the visibility of the modal
  //   timeNow: Date // The currently selected date (initial value)
  setTimeNow: (date: Date) => void // Function to update the selected date
  setIsDatePickerVisible: (visible: boolean) => void // Function to update the visibility of the modal
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isDatePickerVisible,
  //   timeNow,
  setTimeNow,
  setIsDatePickerVisible,
}) => {
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
    />
  )
}

const styles = StyleSheet.create({})

export default DatePickerModal
