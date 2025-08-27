import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  FlatList,
  Modal,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

export interface DropdownOption {
  id: string
  label: string
  value: string
}

interface DropdownProps {
  label?: string
  placeholder?: string
  options: DropdownOption[]
  selectedValue?: string | null
  onSelectionChange: (value: string | null) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  required?: boolean
  disabled?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onSelectionChange,
  error,
  helperText,
  containerStyle,
  inputStyle,
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const selectedOption = options.find(option => option.value === selectedValue)

  const handleSelect = (option: DropdownOption) => {
    onSelectionChange(option.value)
    setIsOpen(false)
    setIsFocused(false)
  }

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true)
      setIsFocused(true)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsFocused(false)
  }

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: error ? '#EF4444' : disabled ? '#9CA3AF' : '#374151',
            marginBottom: 8,
          }}
        >
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      )}

      {/* Dropdown container */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderColor: error
              ? '#FCA5A5'
              : isFocused
              ? '#241c4c'
              : '#D1D5DB',
            opacity: disabled ? 0.6 : 1,
          },
          inputStyle,
        ]}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: selectedOption ? '#111827' : '#9CA3AF',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color={disabled ? '#9CA3AF' : '#6B7280'}
        />
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

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              margin: 20,
              maxHeight: 400,
              minWidth: 280,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                {label || 'Select Option'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor:
                      selectedValue === item.value ? '#F3F4F6' : 'transparent',
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#111827',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color="#241c4c"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default Dropdown