import React, { useState } from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { isValidDate } from '@/lib/safeDate'

interface DateTimePickerProps {
  label?: string
  value?: Date
  onDateTimeChange: (date: Date) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
  placeholder?: string
  mode?: 'date' | 'time' | 'datetime'
}

const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onDateTimeChange,
  error,
  helperText,
  containerStyle,
  required = false,
  placeholder = 'Select Date & Time',
  mode = 'datetime',
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const formatDateTime = (date: Date) => {
    // Validate date before using it
    if (!isValidDate(date)) {
      return ''
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    if (mode === 'date') {
      return `${year}-${month}-${day}`
    } else if (mode === 'time') {
      return `${hours}:${minutes}`
    } else {
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleConfirm = (date: Date) => {
    onDateTimeChange(date)
    hideDatePicker()
  }

  // Calendar icon as text (you can replace with actual icon component)
  const CalendarIcon = () => (
    <Text style={{ fontSize: 16, color: '#6B7280' }}>📅</Text>
  )

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: error ? '#EF4444' : '#374151',
            marginBottom: 8,
          }}
        >
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      )}

      {/* DateTime picker button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderColor: error ? '#FCA5A5' : '#D1D5DB',
          minWidth: 250,
          alignSelf: 'flex-start',
        }}
        onPress={showDatePicker}
        activeOpacity={0.7}
      >
        {/* Calendar/Clock icon */}
        <View style={{ marginRight: 12 }}>
          <CalendarIcon />
        </View>

        {/* DateTime text */}
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: value ? '#111827' : '#9CA3AF',
          }}
        >
          {value ? formatDateTime(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Helper text or error message */}
      {(error || helperText) && (
        <Text
          style={{
            fontSize: 11,
            color: error ? '#EF4444' : '#6B7280',
            marginTop: 6,
          }}
        >
          {error || helperText}
        </Text>
      )}

      {/* DateTimePicker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={mode}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={value && isValidDate(value) ? value : new Date()}
      />
    </View>
  )
}

export default CustomDateTimePicker
