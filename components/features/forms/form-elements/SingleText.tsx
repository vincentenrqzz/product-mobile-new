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

interface SingleTextProps extends TextInputProps {
  label?: string
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
}

const SingleText: React.FC<SingleTextProps> = ({
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

      {/* Input container */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderColor: error ? '#FCA5A5' : isFocused ? '#241c4c' : '#D1D5DB',
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: 12, opacity: 0.7 }}>{leftIcon}</View>
        )}

        <TextInput
          style={[
            {
              flex: 1,
              fontSize: 14,
              color: '#111827',
              paddingVertical: 0,
            },
            inputStyle,
          ]}
          placeholderTextColor="#9CA3AF"
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ marginLeft: 12, opacity: 0.7 }}
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

export default SingleText
