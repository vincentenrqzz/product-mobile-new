import React from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { formatSafeDateTime, createSafeDate, isValidDate } from '@/lib/safeDate'

interface DateTimeRegisterProps {
  label?: string
  value?: Date | string | null
  onDateTimeChange: (date: Date) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
  placeholder?: string
}

const DateTimeRegister: React.FC<DateTimeRegisterProps> = ({
  label,
  value,
  onDateTimeChange,
  error,
  helperText,
  containerStyle,
  required = false,
  placeholder = 'Register Now',
}) => {
  // Convert value to Date object for consistent handling
  const dateValue = React.useMemo(() => {
    if (!value) return null
    return createSafeDate(value)
  }, [value])

  // Check if we have a valid date to display
  const hasValidDate = dateValue && isValidDate(dateValue) && dateValue.getTime() !== 0

  const formatDateTime = (date: Date) => {
    return formatSafeDateTime(date)
  }

  const handleRegisterNow = () => {
    const now = new Date()
    onDateTimeChange(now)
  }

  // Clock icon
  const ClockIcon = () => (
    <Text style={{ fontSize: 14, color: '#6B7280' }}>🕒</Text>
  )

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
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

      {/* DateTime register button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderColor: error ? '#FCA5A5' : '#D1D5DB',
          minWidth: 180,
          alignSelf: 'flex-start',
        }}
        onPress={handleRegisterNow}
        activeOpacity={0.7}
      >
        {/* Clock icon */}
        <View style={{ marginRight: 8 }}>
          <ClockIcon />
        </View>

        {/* DateTime text */}
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: hasValidDate ? '#111827' : '#9CA3AF',
          }}
        >
          {hasValidDate && dateValue ? formatDateTime(dateValue) : placeholder}
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

export default DateTimeRegister