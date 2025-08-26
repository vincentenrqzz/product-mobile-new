import DateTimePicker from '@react-native-community/datetimepicker'
import React, { useState } from 'react'
import {
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

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
  const [showPicker, setShowPicker] = useState(false)
  const [tempDate, setTempDate] = useState(value || new Date())

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    if (mode === 'date') {
      return `${year}-${month}-${day}`
    } else if (mode === 'time') {
      return `${hours}:${minutes}:${seconds}`
    } else {
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const { type } = event
    
    if (Platform.OS === 'android') {
      setShowPicker(false)
      
      if (type === 'dismissed') {
        // User cancelled the picker
        return
      }
      
      if (type === 'set' && selectedDate) {
        setTempDate(selectedDate)
        onDateTimeChange(selectedDate)
      }
    } else {
      // iOS handling
      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }
  }

  const handleConfirm = () => {
    onDateTimeChange(tempDate)
    setShowPicker(false)
  }

  const handleCancel = () => {
    setTempDate(value || new Date())
    setShowPicker(false)
  }

  // Calendar icon as text (you can replace with actual icon component)
  const CalendarIcon = () => (
    <Text style={{ fontSize: 18, color: '#6B7280' }}>🕒</Text>
  )

  const renderIOSPicker = () => (
    <Modal
      transparent={true}
      animationType="slide"
      visible={showPicker}
      onRequestClose={() => setShowPicker(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingBottom: 34,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          {/* Header with buttons */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <TouchableOpacity onPress={handleCancel}>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
              {mode === 'date'
                ? 'Select Date'
                : mode === 'time'
                  ? 'Select Time'
                  : 'Select Date & Time'}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text
                style={{ fontSize: 16, color: '#3B82F6', fontWeight: '600' }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* DateTime Picker */}
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={handleDateChange}
            style={{ backgroundColor: '#FFFFFF' }}
          />
        </View>
      </View>
    </Modal>
  )

  const renderAndroidPicker = () => {
    if (!showPicker) return null

    try {
      return (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="default"
          onChange={handleDateChange}
          is24Hour={true}
        />
      )
    } catch (error) {
      console.warn('DateTimePicker error:', error)
      setShowPicker(false)
      return null
    }
  }

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 14,
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
        onPress={() => setShowPicker(true)}
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
            fontSize: 16,
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
            fontSize: 12,
            color: error ? '#EF4444' : '#6B7280',
            marginTop: 6,
          }}
        >
          {error || helperText}
        </Text>
      )}

      {/* Platform-specific pickers */}
      {Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker()}
    </View>
  )
}

export default CustomDateTimePicker
