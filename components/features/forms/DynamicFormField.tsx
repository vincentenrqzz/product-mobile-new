import React from 'react'
import { CreateComponentProps, FormFieldTypes, ParsedFormField } from '@/types/form'

// Import all form element components
import TextForm from './form-elements/TextForm'
import SingleText from './form-elements/SingleText'
import DatePickerButton from './form-elements/DatePickerButton'
import DateTimePicker from './form-elements/DateTimePicker'
import DateTimeRegister from './form-elements/DateTimeRegister'
import CheckboxGroup from './form-elements/CheckboxGroup'
import RadioGroup from './form-elements/RadioGroup'
import Dropdown from './form-elements/Dropdown'
import SubmitButton from './form-elements/SubmitButton'
import TakePictureButton from './form-elements/TakePictureButton'
import AttachFile from './form-elements/AttachFile'
import Signature from './form-elements/Signature'
import PrinterButton from './form-elements/PrinterButton'
import Markup from './form-elements/Markup'
import Survey from './form-elements/Survey'
import AccordionContainer from './form-elements/AccordionContainer'
import AssignedField from './form-elements/AssignedField'

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
  formik
}) => {
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
    formik
  }

  // Filter out geo fields - they should be hidden
  if (field.inputType === FormFieldTypes.GEO) {
    return null
  }

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
          return (
            <SingleText
              {...commonProps}
              onChangeText={handleChange}
            />
          )
        }

      case FormFieldTypes.DATE_PICKER:
        return (
          <DatePickerButton
            {...commonProps}
            onDateSelect={handleChange}
          />
        )

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
            options={Array.isArray(field.options) ? field.options : []}
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
            options={Array.isArray(field.options) ? field.options : []}
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
            error={error}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
          />
        )

      case FormFieldTypes.ATTACH_BUTTON:
        return (
          <AttachFile
            label={field.label}
            onFileSelect={handleChange}
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
        return (
          <Markup
            content={field.description || field.label}
          />
        )

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
        return (
          <SubmitButton
            title={field.label}
            onPress={formik ? formik.handleSubmit : () => handleChange(null)}
            size="small"
            formik={formik ? {
              values: formik.values,
              errors: formik.errors,
              touched: formik.touched,
              isValid: Object.keys(formik.errors).length === 0,
              isSubmitting: false, // You can implement submission state tracking if needed
              handleSubmit: formik.handleSubmit
            } : undefined}
          />
        )

      case FormFieldTypes.ACCORDION:
        return (
          <AccordionContainer
            label={field.label}
            required={field.rules?.required === true}
            helperText={field.note || field.description}
            error={error}
            fields={Array.isArray(field.options?.formFields) ? field.options.formFields : []}
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
        return (
          <SingleText
            {...commonProps}
            onChangeText={handleChange}
          />
        )
    }
  }

  return renderFormField()
}

export default DynamicFormField