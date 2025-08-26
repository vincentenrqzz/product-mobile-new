import React from 'react'
import {
  ActivityIndicator,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native'

interface SubmitButtonProps extends TouchableOpacityProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  containerStyle?: ViewStyle
  textStyle?: TextStyle
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  containerStyle,
  textStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const isDisabled = disabled || loading

  // Size configurations
  const sizeConfig = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
      minHeight: 36,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 16,
      minHeight: 48,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: 18,
      minHeight: 56,
    },
  }

  // Variant configurations
  const getVariantStyles = () => {
    const baseStyle = {
      borderRadius: 8,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...sizeConfig[size],
    }

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled ? '#9CA3AF' : '#3B82F6',
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600' as const,
            fontSize: sizeConfig[size].fontSize,
          },
        }
      case 'secondary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled ? '#F3F4F6' : '#F9FAFB',
            borderWidth: 1,
            borderColor: isDisabled ? '#D1D5DB' : '#E5E7EB',
          },
          text: {
            color: isDisabled ? '#9CA3AF' : '#374151',
            fontWeight: '600' as const,
            fontSize: sizeConfig[size].fontSize,
          },
        }
      case 'outline':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled ? '#9CA3AF' : '#3B82F6',
            borderWidth: 1,
            borderColor: isDisabled ? '#D1D5DB' : '#3B82F6',
            alignSelf: 'center' as const, // Centers the button
            minWidth: 250, // Minimum width for better UX
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600' as const,
            fontSize: sizeConfig[size].fontSize,
          },
        }
      default:
        return {
          container: baseStyle,
          text: {
            fontSize: sizeConfig[size].fontSize,
          },
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.8}
      {...props}
    >
      {leftIcon && !loading && (
        <React.Fragment>
          {leftIcon}
          <Text style={{ width: 8 }} />
        </React.Fragment>
      )}

      {loading && (
        <React.Fragment>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#FFFFFF' : '#3B82F6'}
          />
          <Text style={{ width: 8 }} />
        </React.Fragment>
      )}

      <Text style={[styles.text, textStyle]}>{title}</Text>

      {rightIcon && !loading && (
        <React.Fragment>
          <Text style={{ width: 8 }} />
          {rightIcon}
        </React.Fragment>
      )}
    </TouchableOpacity>
  )
}

export default SubmitButton
