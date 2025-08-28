import React, { useState } from 'react'
import { Alert, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { isValidDate } from '@/lib/safeDate'

interface DatePickerButtonProps {
  label?: string
  onDateSelect?: (date: string) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
  placeholder?: string
}

const DatePickerButton: React.FC<DatePickerButtonProps> = ({
  label,
  onDateSelect,
  error,
  helperText,
  containerStyle,
  required = false,
  placeholder = 'Select Date',
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const hours = String(today.getHours()).padStart(2, '0')
    const minutes = String(today.getMinutes()).padStart(2, '0')
    const seconds = String(today.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const getCurrentDateWithZ = () => {
    const today = new Date()
    return today.toISOString() // Returns format like "2025-08-14T11:20:15.000Z"
  }

  const formatDisplayDate = (dateString: string) => {
    // Validate date string before creating Date object
    if (!dateString) {
      return 'Invalid date'
    }
    
    const date = new Date(dateString)
    
    // Check if the date is valid using our safe utility
    if (!isValidDate(date)) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handlePress = () => {
    const currentDateDisplay = getCurrentDate() // For display: "2025-08-14"
    const currentDateWithZ = getCurrentDateWithZ() // For output: "2025-08-14T11:20:15.000Z"
    const displayDate = formatDisplayDate(currentDateDisplay)

    setSelectedDate(currentDateDisplay) // Store display format for UI
    onDateSelect?.(currentDateWithZ) // Pass ISO format with Z to callback

    Alert.alert('Date Selected', `Today's date: ${displayDate}`, [
      { text: 'OK', style: 'default' },
    ])
  }

  // Calendar icon as text (you can replace with actual icon component)
  const CalendarIcon = () => (
    <Text style={{ fontSize: 14, color: '#6B7280' }}>📅</Text>
  )

  return (
    <View style={[{ marginBottom: 12 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: error ? '#EF4444' : '#374151',
            marginBottom: 6,
          }}
        >
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      )}

      {/* Date picker button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 8,
          paddingVertical: 8,
          borderColor: error ? '#FCA5A5' : '#D1D5DB',
          minWidth: 200,
          alignSelf: 'flex-start',
        }}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Calendar icon */}
        <View style={{ marginRight: 8 }}>
          <CalendarIcon />
        </View>

        {/* Date text */}
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            color: selectedDate ? '#111827' : '#9CA3AF',
          }}
        >
          {selectedDate ? selectedDate : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Helper text or error message */}
      {(error || helperText) && (
        <Text
          style={{
            fontSize: 10,
            color: error ? '#EF4444' : '#6B7280',
            marginTop: 4,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  )
}

export default DatePickerButton
