import AttachFile from '@/components/features/forms/form-elements/AttachFile'
import CheckboxGroup from '@/components/features/forms/form-elements/CheckboxGroup'
import DatePickerButton from '@/components/features/forms/form-elements/DatePickerButton'
import CustomDateTimePicker from '@/components/features/forms/form-elements/DateTimePicker'
import Dropdown from '@/components/features/forms/form-elements/Dropdown'
import Markup from '@/components/features/forms/form-elements/Markup'
import PrinterButton from '@/components/features/forms/form-elements/PrinterButton'
import RadioGroup from '@/components/features/forms/form-elements/RadioGroup'
import Signature from '@/components/features/forms/form-elements/Signature'
import SingleText from '@/components/features/forms/form-elements/SingleText'
import SubmitButton from '@/components/features/forms/form-elements/SubmitButton'
import Survey from '@/components/features/forms/form-elements/Survey'
import TakePictureButton from '@/components/features/forms/form-elements/TakePictureButton'
import TextForm from '@/components/features/forms/form-elements/TextForm'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { Task } from '@/store/tasks'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { isValidDate } from '@/lib/safeDate'

const TaskForm = () => {
  // builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task, fromListItemTab, statusLabels } = params

  // parse task param
  console.log('parsedTask', task)
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)

  // Component mapping for dynamic form rendering
  const componentMap = {
    text: SingleText,
    textarea: TextForm,
    checkboxes: CheckboxGroup,
    radios: RadioGroup,
    dropdown: Dropdown,
    datePicker: DatePickerButton,
    dateTimePicker: CustomDateTimePicker,
    cameraButton: TakePictureButton,
    markup: Markup,
    survey: Survey,
    signature: Signature,
    attachButton: AttachFile,
    printButton: PrinterButton,
    button: SubmitButton,
  }

  // Dynamic form fields based on task form data
  const getFormFields = () => {
    // Check if task has form data
    if (parsedTask?.form && Array.isArray(parsedTask.form) && parsedTask.form.length > 0) {
      return parsedTask.form.map((formField) => ({
        type: mapInputTypeToComponentType(formField.inputType),
        key: formField.key,
        label: formField.label,
        placeholder: formField.placeholder,
        description: formField.description,
        required: formField.rules?.required || false,
        defaultValue: formField.defaultValue,
        value: formField.value,
        options: parseOptions(formField.options),
        validation: formField.validation,
        note: formField.note,
        conditions: formField.conditions,
        uniqueId: formField.uniqueId,
        videoDurationLimit: formField.videoDurationLimit,
        captureMode: formField.captureMode,
        itemLimit: formField.itemLimit,
        gallery: formField.gallery,
      }))
    }

    // Fallback to default form if no form fields are defined
    return [
      {
        type: 'text',
        key: 'defaultInput',
        label: 'Input',
        placeholder: 'Enter value...',
        required: false,
      },
      {
        type: 'button',
        key: 'submit',
        label: 'Submit',
        variant: 'primary',
        size: 'small',
      },
    ]
  }

  // Map inputType from form field to component type
  const mapInputTypeToComponentType = (inputType: string): string => {
    const typeMapping: Record<string, string> = {
      // Text inputs
      text: 'text',
      textarea: 'textarea',
      
      // Date and time
      dateTimeRegister: 'dateTimePicker',
      datePicker: 'datePicker',
      dateTimePicker: 'dateTimePicker',
      
      // Selection inputs
      dropdown: 'dropdown',
      autocomplete: 'dropdown', // Use dropdown for autocomplete for now
      radios: 'radios',
      checkboxes: 'checkboxes',
      
      // Media and files
      cameraButton: 'cameraButton',
      attachButton: 'attachButton',
      signature: 'signature',
      
      // Interactive elements
      survey: 'survey',
      button: 'button',
      printButton: 'printButton',
      
      // Display elements
      markup: 'markup',
      
      // Geo and assignment (for future implementation)
      geo: 'markup', // Fallback to markup for now
      assigned: 'markup', // Fallback to markup for now
      droppableAccordion: 'markup', // Fallback to markup for now
    }

    return typeMapping[inputType] || 'text' // Default to text input
  }

  // Parse options from form field options
  const parseOptions = (options: any): any[] => {
    if (!options) return []
    
    // If options is already an array of objects with id, label, value structure
    if (Array.isArray(options)) {
      return options.map((option, index) => ({
        id: option.id || `option_${index}`,
        label: option.label || option.name || option.text || String(option),
        value: option.value || option.key || option.id || String(option),
      }))
    }
    
    // If options is an object, convert to array
    if (typeof options === 'object') {
      return Object.entries(options).map(([key, value], index) => ({
        id: `option_${index}`,
        label: String(value),
        value: key,
      }))
    }
    
    return []
  }

  // Dynamic form values based on form configuration
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current task form fields
  const currentFormFields = getFormFields()

  // Initialize form values with defaults
  useEffect(() => {
    const initialValues: Record<string, any> = {}
    
    currentFormFields.forEach((field) => {
      // Set initial value from field's defaultValue or value property
      const hasDefaultValue = 'defaultValue' in field && field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== ''
      const hasValue = 'value' in field && field.value !== undefined && field.value !== null && field.value !== ''
      
      if (hasDefaultValue) {
        // Handle date fields specially - convert strings to Date objects
        if (field.type === 'dateTimePicker' && typeof field.defaultValue === 'string') {
          const parsedDate = new Date(field.defaultValue)
          initialValues[field.key] = isValidDate(parsedDate) ? parsedDate : undefined
        } else {
          initialValues[field.key] = field.defaultValue
        }
      } else if (hasValue) {
        // Handle date fields specially - convert strings to Date objects
        if (field.type === 'dateTimePicker' && typeof field.value === 'string') {
          const parsedDate = new Date(field.value)
          initialValues[field.key] = isValidDate(parsedDate) ? parsedDate : undefined
        } else {
          initialValues[field.key] = field.value
        }
      } else {
        // Set appropriate default based on field type
        switch (field.type) {
          case 'checkboxes':
            initialValues[field.key] = []
            break
          case 'radios':
          case 'dropdown':
            initialValues[field.key] = null
            break
          case 'dateTimePicker':
            initialValues[field.key] = undefined // Let the component handle default
            break
          default:
            initialValues[field.key] = ''
        }
      }
    })
    
    setFormValues(initialValues)
  }, [parsedTask])

  // Dynamic form value updater with validation
  const updateFormValue = (key: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Clear any existing error for this field when user starts typing
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })
  }

  // Field-level error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: Record<string, string> = {}
    
    currentFormFields.forEach((field) => {
      const value = formValues[field.key]
      
      // Check required fields
      if (field.required) {
        const isEmpty = !value || 
          (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && value.trim() === '')
          
        if (isEmpty) {
          newErrors[field.key] = `${field.label} is required`
        }
      }
      
      // Additional validation for text fields
      if (field.type === 'text' && value && field.validation) {
        // Check min length
        if (field.validation.minLength && value.length < field.validation.minLength) {
          newErrors[field.key] = `${field.label} must be at least ${field.validation.minLength} characters`
        }
        
        // Check max length
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.key] = `${field.label} must be no more than ${field.validation.maxLength} characters`
        }
      }
    })

    // If there are validation errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      return
    }

    // Clear any existing errors
    setFieldErrors({})

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // console.log('Form submitted:', formValues)
      alert('Form submitted successfully!')

      // Reset form
      setFormValues({})
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dynamic component renderer
  const renderFormField = (field: any, index: number) => {
    const Component = componentMap[field.type]
    if (!Component) return null

    const commonProps = {
      key: field.key,
      label: field.label,
      error: fieldErrors[field.key] || field.error,
      helperText: field.helperText || field.description || field.note,
      required: field.required,
    }

    const fieldValue = formValues[field.key]

    switch (field.type) {
      case 'text':
        return (
          <Component
            {...commonProps}
            placeholder={field.placeholder || 'Enter text...'}
            value={fieldValue || ''}
            onChangeText={(value: string) => updateFormValue(field.key, value)}
            multiline={false}
            maxLength={field.validation?.maxLength}
          />
        )

      case 'textarea':
        return (
          <Component
            {...commonProps}
            placeholder={field.placeholder || 'Enter detailed text...'}
            value={fieldValue || ''}
            onChangeText={(value: string) => updateFormValue(field.key, value)}
            minHeight={field.minHeight || 100}
            maxHeight={field.maxHeight || 200}
            multiline={true}
          />
        )

      case 'checkboxes':
        return (
          <Component
            {...commonProps}
            options={field.options}
            selectedValues={fieldValue || []}
            onSelectionChange={(value: string[]) =>
              updateFormValue(field.key, value)
            }
          />
        )

      case 'radios':
        return (
          <Component
            {...commonProps}
            options={field.options}
            selectedValue={fieldValue || null}
            onSelectionChange={(value: string) =>
              updateFormValue(field.key, value)
            }
          />
        )

      case 'dropdown':
        return (
          <Component
            {...commonProps}
            placeholder={field.placeholder}
            options={field.options}
            selectedValue={fieldValue || null}
            onSelectionChange={(value: string) =>
              updateFormValue(field.key, value)
            }
          />
        )

      case 'datePicker':
        return (
          <Component
            {...commonProps}
            placeholder={field.placeholder}
            onDateSelect={(value: string) => updateFormValue(field.key, value)}
          />
        )

      case 'dateTimePicker':
        // Convert fieldValue to Date object if it's not already
        let dateValue: Date | undefined = undefined
        if (fieldValue) {
          if (fieldValue instanceof Date && isValidDate(fieldValue)) {
            dateValue = fieldValue
          } else if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
            const parsedDate = new Date(fieldValue)
            dateValue = isValidDate(parsedDate) ? parsedDate : undefined
          }
        }
        return (
          <Component
            {...commonProps}
            placeholder={field.placeholder}
            value={dateValue}
            onDateTimeChange={(value: Date) =>
              updateFormValue(field.key, value)
            }
          />
        )

      case 'cameraButton':
        return (
          <Component
            {...commonProps}
            onMediaSelect={(value: any) => updateFormValue(field.key, value)}
          />
        )

      case 'markup':
        return (
          <Component
            {...commonProps}
            taskData={parsedTask}
            currentFormValues={formValues}
          />
        )

      case 'survey':
        return (
          <Component
            {...commonProps}
            onRatingSelect={(value: number) =>
              updateFormValue(field.key, value)
            }
            selectedRating={fieldValue}
            stepsNumber={field.stepsNumber}
            preWord={field.preWord}
            postWord={field.postWord}
          />
        )

      case 'signature':
        return (
          <Component
            {...commonProps}
            onSignatureCapture={(value: string) =>
              updateFormValue(field.key, value)
            }
            value={fieldValue}
          />
        )

      case 'attachButton':
        return (
          <Component
            {...commonProps}
            onFileSelect={(value: any) => updateFormValue(field.key, value)}
            selectedFiles={fieldValue || []}
            maxFileSize={field.maxFileSize}
          />
        )

      case 'printButton':
        return (
          <Component
            {...commonProps}
            title={field.label}
            onPress={() => alert(`${field.label} pressed!`)}
            variant={field.variant}
            size={field.size}
            containerStyle={{ marginBottom: 16 }}
          />
        )

      case 'button':
        return (
          <Component
            {...commonProps}
            title={field.label}
            onPress={
              field.key === 'submit'
                ? handleSubmit
                : () => alert(`${field.label} pressed!`)
            }
            variant={field.variant}
            size={field.size}
            loading={field.key === 'submit' ? isSubmitting : false}
            containerStyle={{ marginBottom: 16 }}
          />
        )

      default:
        return null
    }
  }

  return (
    <ParallaxScrollView>
      <BackButton title={`${parsedTask.taskType} ${parsedTask.taskId}`} />
      <View style={{ marginTop: 20 }}>
        {/* Debug Info - Show form fields */}
        {currentFormFields.length === 0 && (
          <View
            style={{
              padding: 16,
              backgroundColor: '#FEF3C7',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#F59E0B',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '600' }}>
              No Form Fields Found
            </Text>
            <Text style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>
              Task: {parsedTask.taskType} (ID: {parsedTask.taskId})
            </Text>
            <Text style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>
              Form data available: {parsedTask?.form ? 'Yes' : 'No'}
            </Text>
            {parsedTask?.form && (
              <Text style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>
                Form fields count: {parsedTask.form.length}
              </Text>
            )}
          </View>
        )}

        {/* Dynamic Form Rendering */}
        {currentFormFields.map((field, index) => (
          <View key={`${field.key}-${index}`} style={{ marginBottom: 0 }}>
            {renderFormField(field, index)}
          </View>
        ))}

        {/* Debug Display - Shows current form fields and values */}
        {currentFormFields.length > 0 && (
          <View
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: '#F0F9FF',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#0EA5E9',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#0C4A6E',
                marginBottom: 12,
              }}
            >
              Debug Information
            </Text>
            
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#0C4A6E',
                marginBottom: 8,
              }}
            >
              Form Fields ({currentFormFields.length}):
            </Text>
            {currentFormFields.map((field, index) => (
              <View key={index} style={{ marginBottom: 6, marginLeft: 8 }}>
                <Text style={{ fontSize: 11, color: '#075985' }}>
                  {index + 1}. {field.key} ({field.type}) - "{field.label}"
                  {field.required && ' *'}
                </Text>
              </View>
            ))}

            {Object.keys(formValues).length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#0C4A6E',
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  Form Values:
                </Text>
                {Object.entries(formValues).map(([key, value]) => (
                  <View key={key} style={{ marginBottom: 6, marginLeft: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#075985' }}>
                      {key}:
                    </Text>
                    <Text style={{ fontSize: 11, color: '#0C4A6E', marginLeft: 12 }}>
                      {Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </View>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonGroup: {
    marginHorizontal: 16,
  },
  image: {
    marginTop: 20,
    alignSelf: 'center',
    width: 300,
    height: 200,
    borderRadius: 10,
  },
})

export default TaskForm
