import { FormFieldTypes, ParsedFormField } from '@/types/form'
import { useRouter } from 'expo-router'
import React from 'react'

// Import all form element components
import useTaskStore from '@/store/tasks'
import AccordionContainer from './form-elements/AccordionContainer'
import AssignedField from './form-elements/AssignedField'
import AttachFile from './form-elements/AttachFile'
import CheckboxGroup from './form-elements/CheckboxGroup'
import DatePickerButton from './form-elements/DatePickerButton'
import DateTimePicker from './form-elements/DateTimePicker'
import DateTimeRegister from './form-elements/DateTimeRegister'
import Dropdown from './form-elements/Dropdown'
import Markup from './form-elements/Markup'
import PrinterButton from './form-elements/PrinterButton'
import RadioGroup from './form-elements/RadioGroup'
import Signature from './form-elements/Signature'
import SingleText from './form-elements/SingleText'
import SubmitButton from './form-elements/SubmitButton'
import Survey from './form-elements/Survey'
import TakePictureButton from './form-elements/TakePictureButton'
import TextForm from './form-elements/TextForm'

interface DynamicFormFieldProps {
  field: ParsedFormField
  value: any
  onChange: (key: string, value: any) => void
  error?: string
  task?: any
  formValues?: Record<string, any>
  formik?: {
    values: Record<string, any>
    errors: Record<string, any>
    touched: Record<string, any>
    handleChange: any
    handleBlur: any
    handleSubmit: any
    setFieldValue: (field: string, value: any) => void
  }
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  task,
  formValues = {},
  formik,
}) => {
  const { addPendingTask } = useTaskStore()
  const router = useRouter()
  const handleChange = (newValue: any) => {
    onChange(field.key, newValue)
  }

  // Create props object for all form elements
  const commonProps = {
    label: field.label,
    placeholder: field.placeholder,
    error,
    required: field.rules?.required === true,
    helperText: field.note || field.description,
    value,
    onValueChange: handleChange,
    field,
    task,
    formValues,
    formik,
  }

  // Helper function to check if a value is considered "empty"
  const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    if (Array.isArray(value) && value.length === 0) {
      return true
    }

    // Don't consider Date objects as empty even if they're objects
    if (value instanceof Date) {
      return false
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true
    }

    return false
  }

  // Helper function to evaluate field conditions
  const evaluateConditions = (
    conditions: Record<string, string[]>,
  ): boolean => {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true // No conditions means field should be visible
    }

    return Object.entries(conditions).every(([fieldKey, conditionValues]) => {
      const fieldValue = formValues[fieldKey]

      return conditionValues.some((condition) => {
        if (condition === '!null') {
          return !isEmpty(fieldValue)
        }
        if (condition === 'null') {
          return isEmpty(fieldValue)
        }
        // Direct value comparison
        return fieldValue === condition
      })
    })
  }

  // Filter out geo fields - they should be hidden
  if (field.inputType === FormFieldTypes.GEO) {
    return null
  }

  // Check field conditions - only show field if conditions are met
  if (field.conditions && !evaluateConditions(field.conditions)) {
    // Debug logging for condition evaluation
    // console.log(`Field ${field.key} hidden due to conditions:`, {
    //   conditions: field.conditions,
    //   formValues,
    //   evaluation: evaluateConditions(field.conditions),
    // })
    return null
  }

  // Debug logging for visible fields
  // if (field.conditions) {
  //   console.log(`Field ${field.key} visible:`, {
  //     conditions: field.conditions,
  //     formValues,
  //     evaluation: evaluateConditions(field.conditions),
  //   })
  // }

  // Map inputType to corresponding component
  const renderFormField = () => {
    switch (field.inputType) {
      case FormFieldTypes.TEXT:
      case FormFieldTypes.TEXTAREA:
        if (field.inputType === FormFieldTypes.TEXTAREA) {
          return (
            <TextForm
              {...commonProps}
              onChangeText={handleChange}
              multiline={true}
              minHeight={100}
            />
          )
        } else {
          return <SingleText {...commonProps} onChangeText={handleChange} />
        }

      case FormFieldTypes.DATE_PICKER:
        return <DatePickerButton {...commonProps} onDateSelect={handleChange} />

      case FormFieldTypes.DATE_TIME_PICKER:
        return (
          <DateTimePicker
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onDateTimeChange={handleChange}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.DATE_TIME_REGISTER:
        return (
          <DateTimeRegister
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onDateTimeChange={handleChange}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.CHECKBOXES:
        return (
          <CheckboxGroup
            label={field.label}
            options={field.options || []}
            selectedValues={Array.isArray(value) ? value : []}
            onSelectionChange={handleChange}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.RADIO:
        return (
          <RadioGroup
            label={field.label}
            options={field.options || []}
            selectedValue={value}
            onSelectionChange={handleChange}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.DROPDOWN:
      case FormFieldTypes.AUTOCOMPLETE:
        return (
          <Dropdown
            label={field.label}
            placeholder={field.placeholder}
            options={Array.isArray(field.options) ? field.options : []}
            selectedValue={value}
            onSelectionChange={handleChange}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.CAMERA_BUTTON:
        return (
          <TakePictureButton
            label={field.label}
            onMediaSelect={handleChange}
            value={Array.isArray(value) ? value : value ? [value] : []}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
            task={task}
          />
        )

      case FormFieldTypes.ATTACH_BUTTON:
        return (
          <AttachFile
            label={field.label}
            onFileSelect={handleChange}
            value={typeof value === 'string' ? value : ''}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.SIGNATURE:
        return (
          <Signature
            label={field.label}
            onSignatureCapture={handleChange}
            value={typeof value === 'string' ? value : ''}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.PRINT:
        return (
          <PrinterButton
            title={field.label}
            onPress={() => handleChange(null)}
            size="small"
          />
        )

      case FormFieldTypes.MARKUP:
        return <Markup content={field.description || field.label} />

      case FormFieldTypes.SURVEY:
        return (
          <Survey
            label={field.label}
            onRatingSelect={handleChange}
            selectedRating={value}
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.BUTTON:
        const handleButtonPress = () => {
          if (formik) {
            // Set current date/time as button value
            const currentDateTime = new Date().toISOString()
            formik.setFieldValue(field.key, currentDateTime)

            // Log the updated task object with injected form values
            const updatedFormValues = {
              ...formik.values,
              [field.key]: currentDateTime,
            }

            const updatedTask = {
              ...task,
              form:
                task?.form?.map((formField: any) => ({
                  ...formField,
                  value:
                    updatedFormValues[formField.key] !== undefined
                      ? updatedFormValues[formField.key]
                      : formField.value,
                })) || [],
              lastUpdatedAt: new Date().toISOString(),
            }

            console.log(
              '🎯 Updated task object with injected form values:',
              JSON.stringify(updatedTask),
            )
            console.log(
              '📝 Form values injected:',
              JSON.stringify(updatedFormValues),
            )

            // Add to pending tasks with the required structure
            const pendingTaskData = {
              task: updatedTask,
              newStatus: 'done',
              partialStatus: 'pending',
            }

            addPendingTask(pendingTaskData)
            console.log(
              '📋 Added task to pending tasks:',
              JSON.stringify(pendingTaskData),
            )

            // Execute form submission
            formik.handleSubmit()

            // Navigate back to tasks screen
            router.push('/(main)/(tabs)/tasks')
          } else {
            // Set current date/time as button value even without formik
            const currentDateTime = new Date().toISOString()
            handleChange(currentDateTime)

            // Navigate back to tasks screen
            router.push('/(main)/(tabs)/tasks')
          }
        }

        return (
          <SubmitButton
            title={field.label}
            onPress={handleButtonPress}
            size="medium"
            variant="primary"
            formik={
              formik
                ? {
                    values: formik.values,
                    errors: formik.errors,
                    touched: formik.touched,
                    isValid: Object.keys(formik.errors).length === 0,
                    isSubmitting: false,
                    handleSubmit: formik.handleSubmit,
                  }
                : undefined
            }
          />
        )

      case FormFieldTypes.ACCORDION:
        return (
          <AccordionContainer
            label={field.label}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
            error={error}
            fields={
              Array.isArray(field.options?.formFields)
                ? field.options.formFields
                : []
            }
            value={value || {}}
            onValueChange={handleChange}
            task={task}
            formValues={formValues}
          />
        )

      case FormFieldTypes.ASSIGNED:
        return (
          <AssignedField
            label={field.label}
            value={value}
            onValueChange={handleChange}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
            error={error}
            placeholder={field.placeholder}
          />
        )

      default:
        // Fallback to text input for unknown types
        console.warn(`Unknown form field type: ${field.inputType}`)
        return <SingleText {...commonProps} onChangeText={handleChange} />
    }
  }

  return renderFormField()
}

export default DynamicFormField
