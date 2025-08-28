import React from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface AssignedFieldProps {
  label: string
  value?: any
  onValueChange?: (value: any) => void
  required?: boolean
  helperText?: string
  error?: string
  placeholder?: string
}

const AssignedField: React.FC<AssignedFieldProps> = ({
  label,
  value,
  onValueChange,
  required = false,
  helperText,
  error,
  placeholder = 'Working hours will be assigned automatically'
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={[styles.content, isDark && styles.contentDark, error && styles.contentError]}>
        <MaterialIcons
          name="schedule"
          size={20}
          color={isDark ? '#9CA3AF' : '#6B7280'}
          style={styles.icon}
        />
        <Text style={[styles.placeholder, isDark && styles.placeholderDark]}>
          {placeholder}
        </Text>
      </View>

      {helperText && (
        <Text style={[styles.helperText, isDark && styles.helperTextDark]}>
          {helperText}
        </Text>
      )}

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  labelDark: {
    color: '#F9FAFB',
  },
  required: {
    color: '#EF4444',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    minHeight: 48,
  },
  contentDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  contentError: {
    borderColor: '#EF4444',
  },
  icon: {
    marginRight: 8,
  },
  placeholder: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  placeholderDark: {
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  helperTextDark: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
})

export default AssignedField