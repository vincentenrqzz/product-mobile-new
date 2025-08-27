import React from 'react'
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native'

interface RadioOption {
  id: string
  label: string
  value: string
}

interface RadioGroupProps {
  label?: string
  options: RadioOption[]
  selectedValue: string | null
  onSelectionChange: (selectedValue: string) => void
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  selectedValue,
  onSelectionChange,
  error,
  helperText,
  containerStyle,
  required = false,
}) => {
  const renderRadio = (option: RadioOption) => {
    const isSelected = selectedValue === option.value

    return (
      <TouchableOpacity
        key={option.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
        onPress={() => onSelectionChange(option.value)}
        activeOpacity={0.7}
      >
        {/* Radio button */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: error ? '#EF4444' : isSelected ? '#241c4c' : '#D1D5DB',
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#241c4c',
              }}
            />
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

      {/* Radio options */}
      <View>{options.map(renderRadio)}</View>

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

export default RadioGroup
