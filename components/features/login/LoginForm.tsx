import FormInput from '@/components/ui/formik/FormInput'
import { useAppTheme } from '@/hooks/useAppTheme'
import { loginSchemas } from '@/schemas/loginSchemas'
import { Ionicons } from '@expo/vector-icons'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

export interface InitialValues {
  customError?: string
  email?: string
  mobile?: string
  password?: string
}

interface Props {
  onLoginPress: (values: any, actions: any) => void
  onForgotPasswordPress: () => void
}
const LoginForm = ({ onLoginPress, onForgotPasswordPress }: Props) => {
  const { colors, isDark } = useAppTheme()
  const [showPassword, setShowPassword] = useState(false)

  const initialValues: InitialValues = {
    email: '',
    password: '',
  }

  const formik = useFormik({
    initialValues,
    onSubmit: onLoginPress,
    validationSchema: loginSchemas,
  })

  return (
    <Animated.View
      entering={FadeIn.duration(700).delay(200)}
      className="mt-20 rounded-xl p-6 shadow-lg"
      style={{ backgroundColor: colors.cardBackground }}
    >
      <View style={{ gap: 24 }}>
        {/* Email Input */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-md font-montserrat-regular"
            style={{ color: colors.text }}
          >
            Email
          </Text>

          <FormInput
            formik={formik}
            name="email"
            placeholder="Enter your email"
            keyboardType="email-address"
            leftElement={
              <Ionicons name="mail" size={20} color={colors.placeholderText} />
            }
          />
        </View>

        {/* Password Input */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-md font-montserrat-regular"
            style={{ color: colors.text }}
          >
            Password
          </Text>

          <FormInput
            formik={formik}
            name="password"
            placeholder="Enter your password"
            placeholderTextColor={colors.placeholderText}
            secureTextEntry={!showPassword}
            leftElement={
              <Ionicons
                name="lock-closed"
                size={20}
                color={colors.placeholderText}
              />
            }
            rightElement={
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="p-2"
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={colors.placeholderText}
                />
              </Pressable>
            }
          />
        </View>

        {/* Error Message */}
        {formik.errors.customError && (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            className="flex-row items-center rounded-lg border border-red-200 bg-red-50 p-3"
          >
            <Ionicons name="warning" size={20} color="#dc2626" />
            <Text className="ml-2 flex-1 text-sm text-red-600">
              {formik.errors.customError || 'Login failed. Please try again.'}
            </Text>
          </Animated.View>
        )}

        {/* Login Button */}
        <Pressable
          onPress={() => {
            formik.handleSubmit()
          }}
          disabled={formik.isSubmitting}
          className="rounded-lg p-4"
          style={{
            backgroundColor:
              formik.isSubmitting ||
              !formik.values.email ||
              !formik.values.password
                ? `${colors.buttons}80`
                : colors.buttons,
          }}
        >
          <View className="flex-row items-center justify-center">
            {formik.isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="log-in" size={20} color="white" />
            )}
            <Text className="ml-2 text-lg text-white">
              {formik.isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </View>
        </Pressable>

        {/* Forgot Password Link */}
        <Pressable
          onPress={onForgotPasswordPress}
          disabled={formik.isSubmitting}
          className="items-end"
        >
          <Text
            className="text-md text-center"
            style={{ color: colors.buttons, opacity: 0.7 }}
          >
            Forgot Password?
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

export default LoginForm
