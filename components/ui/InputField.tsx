import { useAppTheme } from '@/hooks/useAppTheme'
import React, { JSX } from 'react'
import {
  Platform,
  StyleProp,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native'

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  leftElement?: JSX.Element
  onChangeText: (text: string) => void
  rightElement?: JSX.Element
  secureTextEntry?: boolean
  style?: StyleProp<ViewStyle> // Style for the View container
}

const InputField: React.FC<InputFieldProps> = ({
  leftElement,
  onChangeText,
  rightElement,
  secureTextEntry = false,
  style, // Accept the className prop
  ...props
}) => {
  const { colors } = useAppTheme()
  return (
    <View
      className={`flex-row items-center  rounded-lg px-3 ${Platform.OS === 'ios' && 'py-3'} `}
      style={[{ backgroundColor: colors.inputBackground }, style]}
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
