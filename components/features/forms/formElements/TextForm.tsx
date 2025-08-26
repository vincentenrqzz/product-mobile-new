import React, { useState } from 'react'
import {
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

interface TextFormProps extends TextInputProps {
  label?: string
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
  minHeight?: number
  maxHeight?: number
}

const TextForm: React.FC<TextFormProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  value,
  minHeight = 100,
  maxHeight = 200,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e: any) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Static label on top */}
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

      {/* Textarea container */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          borderWidth: 1,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderColor: error ? '#FCA5A5' : isFocused ? '#3B82F6' : '#D1D5DB',
          minHeight: minHeight,
          maxHeight: maxHeight,
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: 12, opacity: 0.7, marginTop: 2 }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: '#111827',
              paddingVertical: 0,
              textAlignVertical: 'top',
              minHeight: minHeight - 24, // Account for container padding
            },
            inputStyle,
          ]}
          placeholderTextColor="#9CA3AF"
          multiline={true}
          numberOfLines={4}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ marginLeft: 12, opacity: 0.7, marginTop: 2 }}
            activeOpacity={0.6}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

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
    </View>
  )
}

export default TextForm
