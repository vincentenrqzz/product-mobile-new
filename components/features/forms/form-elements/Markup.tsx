import React, { useState, useEffect } from 'react'
import { View, ViewStyle, useWindowDimensions, Text, TouchableOpacity } from 'react-native'
import RenderHtml from 'react-native-render-html'
import moment from 'moment'
import { MaterialIcons } from '@expo/vector-icons'

interface MarkupProps {
  label?: string
  content?: string
  taskData?: any
  currentFormValues?: Record<string, any>
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
}

const Markup: React.FC<MarkupProps> = ({
  label,
  content,
  taskData,
  currentFormValues = {},
  error,
  helperText,
  containerStyle,
  required = false,
}) => {
  const [processedContent, setProcessedContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const { width } = useWindowDimensions()

  // Default HTML content with template variables
  const defaultContent = content || `
    <div style="padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px; background-color: #F9FAFB;">
      <h3 style="color: #241c4c; margin-bottom: 12px;">Task Information</h3>
      <p><strong>Task ID:</strong> {{task:taskId}}</p>
      <p><strong>Task Type:</strong> {{task:taskType}}</p>
      <p><strong>Current Time:</strong> {{global:time}}</p>
      <p><strong>Description:</strong> {{field:description}}</p>
      <p><strong>Priority:</strong> {{field:priority}}</p>
      <br>
      <p style="font-style: italic; color: #6B7280;">This is a sample markup component that can render HTML content with dynamic template variables.</p>
    </div>
  `

  // Simple template variable parser
  const processTemplate = (htmlContent: string) => {
    let result = htmlContent

    // Process global variables
    result = result.replace(/{{global:time}}/g, moment().format('DD/MM/YYYY HH:mm'))

    // Process task variables (dummy data)
    const dummyTaskData = {
      taskId: 'TASK-001',
      taskType: 'Sample Task',
      groupName: 'Development Team',
      statusId: 'in-progress',
      ...taskData,
    }

    result = result.replace(/{{task:(\w+)}}/g, (match, key) => {
      return dummyTaskData[key] || match
    })

    // Process field variables from current form values
    result = result.replace(/{{field:(\w+)}}/g, (match, key) => {
      const formValue = currentFormValues[key]
      if (formValue != null) {
        if (Array.isArray(formValue)) {
          return formValue.join(', ')
        }
        if (typeof formValue === 'boolean') {
          return formValue ? 'Yes' : 'No'
        }
        return formValue.toString()
      }
      return match
    })

    // Process data variables (dummy data)
    const dummyData = {
      userName: 'John Doe',
      department: 'IT Department',
      location: 'Office Building A',
      phone: '+1 (555) 123-4567',
    }

    result = result.replace(/{{data:(\w+)}}/g, (match, key) => {
      return dummyData[key] || match
    })

    return result
  }

  useEffect(() => {
    const processed = processTemplate(defaultContent)
    setProcessedContent(processed)
  }, [defaultContent, currentFormValues, taskData])

  const source = {
    html: processedContent,
  }

  const tagsStyles = {
    body: {
      color: '#374151',
      fontSize: 14,
    },
    h3: {
      color: '#241c4c',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    p: {
      marginBottom: 8,
      lineHeight: 20,
    },
    strong: {
      fontWeight: '600',
      color: '#111827',
    },
    div: {
      marginBottom: 8,
    },
  }

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
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

      {/* Markup Button - Similar to TakePictureButton */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
          backgroundColor: '#241c4c',
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
        }}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="description"
          size={16}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 14,
          }}
        >
          View Summary
        </Text>
      </TouchableOpacity>

      {/* Expanded HTML Content */}
      {isExpanded && (
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: error ? '#FCA5A5' : '#E5E7EB',
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          <RenderHtml 
            contentWidth={width - 48} // Account for padding
            source={source}
            tagsStyles={tagsStyles}
          />
        </View>
      )}

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

export default Markup