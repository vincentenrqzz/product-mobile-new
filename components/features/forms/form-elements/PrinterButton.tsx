import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import {
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native'

interface PrinterButtonProps extends TouchableOpacityProps {
  title?: string
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  containerStyle?: ViewStyle
  textStyle?: TextStyle
  icon?: React.ReactNode
}

const PrinterButton: React.FC<PrinterButtonProps> = ({
  title = 'Print',
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  containerStyle,
  textStyle,
  icon,
  ...props
}) => {
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

  // Default printer icon if none provided
  const defaultIcon = (
    <MaterialIcons
      name="print"
      size={sizeConfig[size].fontSize * 1.2}
      color={
        variant === 'outline' ? (disabled ? '#9CA3AF' : '#241c4c') : '#FFFFFF'
      }
      style={{ marginRight: 8 }}
    />
  )

  // Variant configurations
  const getVariantStyles = () => {
    const baseStyle = {
      borderRadius: 8,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      alignSelf: 'flex-start' as const,
      ...sizeConfig[size],
    }

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled ? '#9CA3AF' : '#241c4c',
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
            backgroundColor: disabled ? '#F3F4F6' : '#F9FAFB',
            borderWidth: 1,
            borderColor: disabled ? '#D1D5DB' : '#E5E7EB',
          },
          text: {
            color: disabled ? '#9CA3AF' : '#374151',
            fontWeight: '600' as const,
            fontSize: sizeConfig[size].fontSize,
          },
        }
      case 'outline':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: disabled ? '#D1D5DB' : '#241c4c',
          },
          text: {
            color: disabled ? '#9CA3AF' : '#241c4c',
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
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      {icon || defaultIcon}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PrinterButton
