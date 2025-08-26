import React, { useState } from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Modal,
  TextInput,
  Alert,
} from 'react-native'

interface SimpleDateTimePickerProps {
  label?: string
  value?: Date
  onDateTimeChange: (date: Date) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
  placeholder?: string
}

const SimpleDateTimePicker: React.FC<SimpleDateTimePickerProps> = ({
  label,
  value,
  onDateTimeChange,
  error,
  helperText,
  containerStyle,
  required = false,
  placeholder = 'Select Date & Time',
}) => {
  const [showModal, setShowModal] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const getCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    
    setDateInput(`${year}-${month}-${day}`)
    setTimeInput(`${hours}:${minutes}`)
  }

  const handleOpenModal = () => {
    if (value) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      const hours = String(value.getHours()).padStart(2, '0')
      const minutes = String(value.getMinutes()).padStart(2, '0')
      
      setDateInput(`${year}-${month}-${day}`)
      setTimeInput(`${hours}:${minutes}`)
    } else {
      getCurrentDateTime()
    }
    setShowModal(true)
  }

  const handleConfirm = () => {
    if (!dateInput || !timeInput) {
      Alert.alert('Error', 'Please enter both date and time')
      return
    }

    try {
      const dateTimeString = `${dateInput}T${timeInput}:00`
      const selectedDate = new Date(dateTimeString)
      
      if (isNaN(selectedDate.getTime())) {
        Alert.alert('Error', 'Please enter valid date and time')
        return
      }

      onDateTimeChange(selectedDate)
      setShowModal(false)
    } catch (error) {
      Alert.alert('Error', 'Please enter valid date and time')
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    setDateInput('')
    setTimeInput('')
  }

  const handleUseNow = () => {
    const now = new Date()
    onDateTimeChange(now)
    setShowModal(false)
  }

  // Clock icon
  const ClockIcon = () => (
    <Text style={{ fontSize: 18, color: '#6B7280' }}>🕒</Text>
  )

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
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        {/* Clock icon */}
        <View style={{ marginRight: 12 }}>
          <ClockIcon />
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

      {/* Modal for date/time input */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showModal}
        onRequestClose={handleCancel}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 20,
              width: '90%',
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#374151',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Select Date & Time
            </Text>

            {/* Date input */}
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#374151' }}>
              Date (YYYY-MM-DD)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                marginBottom: 16,
              }}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="2025-08-14"
              keyboardType="numeric"
            />

            {/* Time input */}
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#374151' }}>
              Time (HH:MM)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                marginBottom: 20,
              }}
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder="19:30"
              keyboardType="numeric"
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: '#F3F4F6',
                }}
                onPress={handleUseNow}
              >
                <Text style={{ color: '#374151', fontWeight: '500' }}>Use Now</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                  }}
                  onPress={handleCancel}
                >
                  <Text style={{ color: '#374151', fontWeight: '500' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: '#3B82F6',
                  }}
                  onPress={handleConfirm}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default SimpleDateTimePicker
