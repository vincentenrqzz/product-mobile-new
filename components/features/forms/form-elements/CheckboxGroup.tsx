import React from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

interface CheckboxOption {
  id: string
  label: string
  value: string
}

interface CheckboxGroupProps {
  label?: string
  options: CheckboxOption[]
  selectedValues: string[]
  onSelectionChange: (selectedValues: string[]) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  error,
  helperText,
  containerStyle,
  required = false,
}) => {
  const toggleSelection = (value: string) => {
    const isSelected = selectedValues.includes(value)
    let newSelection: string[]
    
    if (isSelected) {
      newSelection = selectedValues.filter(item => item !== value)
    } else {
      newSelection = [...selectedValues, value]
    }
    
    onSelectionChange(newSelection)
  }

  const renderCheckbox = (option: CheckboxOption) => {
    const isSelected = selectedValues.includes(option.value)
    
    return (
      <TouchableOpacity
        key={option.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
        onPress={() => toggleSelection(option.value)}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: error ? '#EF4444' : isSelected ? '#241c4c' : '#D1D5DB',
            backgroundColor: isSelected ? '#241c4c' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {isSelected && (
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            >
              ✓
            </Text>
          )}
        </View>
        
        {/* Label */}
        <Text
          style={{
            fontSize: 14,
            color: '#374151',
            flex: 1,
          }}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Group label */}
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: error ? '#EF4444' : '#374151',
            marginBottom: 12,
          }}
        >
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      )}

      {/* Checkbox options */}
      <View>
        {options.map(renderCheckbox)}
      </View>

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
    </View>
  )
}

export default CheckboxGroup
