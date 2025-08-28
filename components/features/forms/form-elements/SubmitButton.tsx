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
  formik?: {
    values: Record<string, any>
    errors: Record<string, any>
    touched: Record<string, any>
    isValid: boolean
    isSubmitting: boolean
    handleSubmit: () => void
  }
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
  formik,
  ...props
}) => {
  // If Formik is available, use its state for loading and validation
  const isFormikLoading = formik?.isSubmitting || false
  const isFormikInvalid = formik ? !formik.isValid : false
  const actualLoading = loading || isFormikLoading
  const isDisabled = disabled || actualLoading || isFormikInvalid

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
      alignSelf: 'center' as const,
      width: '50%',
      ...sizeConfig[size],
    }

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled ? '#9CA3AF' : '#241c4c',
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
            backgroundColor: isDisabled ? '#9CA3AF' : '#241c4c',
            borderWidth: 1,
            borderColor: isDisabled ? '#D1D5DB' : '#241c4c',
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
      {leftIcon && !actualLoading && (
        <React.Fragment>
          {leftIcon}
          <Text style={{ width: 8 }} />
        </React.Fragment>
      )}

      {actualLoading && (
        <React.Fragment>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#FFFFFF' : '#241c4c'}
          />
          <Text style={{ width: 8 }} />
        </React.Fragment>
      )}

      <Text style={[styles.text, textStyle]}>{title}</Text>

      {rightIcon && !actualLoading && (
        <React.Fragment>
          <Text style={{ width: 8 }} />
          {rightIcon}
        </React.Fragment>
      )}
    </TouchableOpacity>
  )
}

export default SubmitButton
