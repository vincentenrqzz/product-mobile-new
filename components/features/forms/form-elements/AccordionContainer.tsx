import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import DynamicFormField from '../DynamicFormField'
import { ParsedFormField } from '@/types/form'

interface AccordionContainerProps {
  label: string
  required?: boolean
  helperText?: string
  error?: string
  fields: ParsedFormField[]
  value: any
  onValueChange: (value: any) => void
  task?: any
  formValues?: Record<string, any>
}

const AccordionContainer: React.FC<AccordionContainerProps> = ({
  label,
  required = false,
  helperText,
  error,
  fields = [],
  value = {},
  onValueChange,
  task,
  formValues = {}
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [isExpanded, setIsExpanded] = useState(false)
  
  const rotateValue = useSharedValue(0)
  const heightValue = useSharedValue(0)

  const toggleExpanded = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    
    rotateValue.value = withSpring(newState ? 180 : 0)
    heightValue.value = withTiming(newState ? 1 : 0, { duration: 300 })
  }

  const handleFieldChange = (key: string, fieldValue: any) => {
    const newValue = {
      ...value,
      [key]: fieldValue
    }
    onValueChange(newValue)
  }

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateValue.value}deg` }],
    }
  })

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: heightValue.value,
      maxHeight: heightValue.value * 1000, // Adjust multiplier as needed
    }
  })

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <Pressable
        style={[styles.header, isDark && styles.headerDark, error && styles.headerError]}
        onPress={toggleExpanded}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
            {helperText && (
              <Text style={[styles.helperText, isDark && styles.helperTextDark]}>
                {helperText}
              </Text>
            )}
          </View>
          <Animated.View style={animatedIconStyle}>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </Animated.View>
        </View>
      </Pressable>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Accordion Content */}
      <Animated.View style={[styles.content, animatedContentStyle]}>
        {isExpanded && (
          <View style={[styles.contentInner, isDark && styles.contentInnerDark]}>
            {fields.map((field, index) => (
              <View key={field.uniqueId || field.key || index} style={styles.fieldContainer}>
                <DynamicFormField
                  field={field}
                  value={value[field.key]}
                  onChange={handleFieldChange}
                  error={undefined} // Individual field errors can be handled separately
                  task={task}
                  formValues={formValues}
                />
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerDark: {
    // Dark mode container styles
  },
  header: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 16,
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  headerError: {
    borderColor: '#EF4444',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  labelDark: {
    color: '#F9FAFB',
  },
  required: {
    color: '#EF4444',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  helperTextDark: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
    padding: 16,
  },
  contentInnerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  fieldContainer: {
    marginBottom: 16,
  },
})

export default AccordionContainer