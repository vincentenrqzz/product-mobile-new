import { useAppTheme } from '@/hooks/useAppTheme'
import React, { JSX } from 'react'
import { TextInput, TextInputProps, View } from 'react-native'

interface InputFieldProps extends TextInputProps {
  [x: string]: any
  leftElement?: JSX.Element
  onChangeText: (text: string) => void
  rightElement?: JSX.Element
  secureTextEntry?: boolean
}

const InputField: React.FC<InputFieldProps> = ({
  leftElement,
  onChangeText,
  rightElement,
  secureTextEntry = false,
  ...props
}) => {
  const { colors } = useAppTheme()

  return (
    <View
      className={`flex-row items-center rounded-lg border p-3`}
      style={{
        backgroundColor: colors.inputBackground,
      }}
    >
      {leftElement}
      <TextInput
        className="ml-2 flex-1 text-base"
        style={{
          color: colors.inputText,
          fontFamily: 'Inter-Regular',
        }}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} // Ensure this prop is passed down
        autoCapitalize="none"
        placeholderTextColor={colors.placeholderText}
        {...props} // Spread the remaining props here
      />
      {rightElement}
    </View>
  )
}

export default InputField
