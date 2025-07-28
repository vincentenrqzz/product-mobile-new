/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import type { FormikValues } from 'formik'
import type { FC, JSX } from 'react'

import React from 'react'
import { Text, TextInputProps, View } from 'react-native'
import InputField from '../InputField'

interface FormInputProps extends TextInputProps {
  editable?: boolean
  formik: FormikValues
  leftElement?: JSX.Element
  name: string
  placeholder: string
  rightElement?: JSX.Element
  secureTextEntry?: boolean
}
const FormInput: FC<FormInputProps> = ({
  editable,
  formik,
  leftElement,
  name,
  placeholder,
  rightElement,
  secureTextEntry = false,
  ...props
}) => {
  return (
    <View>
      <InputField
        leftElement={leftElement}
        rightElement={rightElement}
        onBlur={formik.handleBlur(name)}
        onChangeText={formik.handleChange(name)}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={formik.values[name]}
        {...props}
      />

      {formik.errors[name] && formik.touched[name] && (
        <Text style={{ color: 'red' }}>{formik.errors[name]}</Text>
      )}
    </View>
  )
}

export default FormInput
