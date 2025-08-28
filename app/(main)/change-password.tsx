import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import FormInput from '@/components/ui/formik/FormInput'
import { useAppTheme } from '@/hooks/useAppTheme'
import { useSubmitChangePassword } from '@/queries/useAuth'
import useAuthStore from '@/store/auth'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { useRouter } from 'expo-router'
import { FormikHelpers, useFormik } from 'formik'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import * as Yup from 'yup'

export type ChangePasswordInitValuesType = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
  customError?: string
}
export const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('missingPassword'),
  newPassword: Yup.string()
    .required('missingPassword')
    .min(8, 'passwordTooShort')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 'passwordMatches'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'confirmPasswordMatches')
    .required('missingConfirmPassword'),
})

const ChangePassword = () => {
  const { colors, isDark } = useAppTheme()
  const { setAuthState } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [getShowPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  })

  const toggleShowPasswordVisibility = (
    inputType: 'oldPassword' | 'newPassword' | 'confirmPassword',
  ) => {
    const newShowPasswords = { ...getShowPasswords }
    if (inputType == 'oldPassword') {
      newShowPasswords.oldPassword = !newShowPasswords.oldPassword
    } else if (inputType == 'newPassword') {
      newShowPasswords.newPassword = !newShowPasswords.newPassword
    } else {
      newShowPasswords.confirmNewPassword = !newShowPasswords.confirmNewPassword
    }
    setShowPasswords(newShowPasswords)
  }

  const onChangePassword = useSubmitChangePassword()
  const initialValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    customError: '',
  }

  const onSubmitHandler = async (
    values: ChangePasswordInitValuesType,
    actions: FormikHelpers<ChangePasswordInitValuesType>,
  ) => {
    setLoading(true)
    const params = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    }
    await onChangePassword
      .mutateAsync(params)
      .then((data) => {
        console.log('data', data)
        actions.resetForm()

        Alert.alert('Change Password Successfully')

        // setTimeout(() => {
        //   if (router.canGoBack()) {
        //     router.back()
        //   } else {
        //     router.replace('/(main)/(tabs)/home') // or whatever route makes sense
        // const { IdToken, ExpiresIn } = data.AuthenticationResult
        // setAuthState(true, IdToken)
        //   }
        // }, 100)
      })
      .catch((error) => {
        console.log('error', error)

        const isNetworkError = error.message?.toLowerCase() === 'network error'
        console.log('isNetworkError', isNetworkError)

        if (axios.isAxiosError(error)) {
          console.log('Axios error message:', error.message)
          console.log('Axios error code:', error.code)
          console.log('Axios error config:', error.config)
          if (error.response) {
            console.log('Axios error status:', error.response.status)
            console.log('Axios error data:', error.response.data)
          }
        } else {
          console.log('Unexpected error:', error)
        }

        actions.setFieldError(
          'customError',
          'Change password failed. Please try again.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const formik = useFormik<ChangePasswordInitValuesType>({
    initialValues,
    onSubmit: onSubmitHandler,
    validationSchema: ChangePasswordSchema,
  })
  return (
    <ParallaxScrollView>
      <Animated.View
        entering={FadeIn.duration(700).delay(200)}
        className="mt-20 rounded-xl p-6 shadow-lg"
        style={{ backgroundColor: colors.cardBackground }}
      >
        <View className="gap-10">
          <BackButton title={`Change Password`} />

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

          {/* Old Password Input */}
          <View style={{ gap: 8 }}>
            <Text
              className="text-md font-montserrat-regular"
              style={{ color: colors.text }}
            >
              Old Password
            </Text>

            <FormInput
              formik={formik}
              name="oldPassword"
              placeholder="Enter your old password"
              placeholderTextColor={colors.placeholderText}
              secureTextEntry={getShowPasswords.oldPassword}
              leftElement={
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={colors.placeholderText}
                />
              }
              rightElement={
                <Pressable
                  onPress={() => toggleShowPasswordVisibility('oldPassword')}
                  className="p-2"
                >
                  <Ionicons
                    name={getShowPasswords.oldPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={colors.placeholderText}
                  />
                </Pressable>
              }
            />
          </View>

          {/* New Password Input */}
          <View style={{ gap: 8 }}>
            <Text
              className="text-md font-montserrat-regular"
              style={{ color: colors.text }}
            >
              New Password
            </Text>

            <FormInput
              formik={formik}
              name="newPassword"
              placeholder="Enter your new password"
              placeholderTextColor={colors.placeholderText}
              secureTextEntry={getShowPasswords.newPassword}
              leftElement={
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={colors.placeholderText}
                />
              }
              rightElement={
                <Pressable
                  onPress={() => toggleShowPasswordVisibility('newPassword')}
                  className="p-2"
                >
                  <Ionicons
                    name={getShowPasswords.newPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={colors.placeholderText}
                  />
                </Pressable>
              }
            />
          </View>

          {/* Old Password Input */}
          <View style={{ gap: 8 }}>
            <Text
              className="text-md font-montserrat-regular"
              style={{ color: colors.text }}
            >
              Confirm Password
            </Text>

            <FormInput
              formik={formik}
              name="confirmPassword"
              placeholder="Enter your confirm password"
              placeholderTextColor={colors.placeholderText}
              secureTextEntry={getShowPasswords.confirmNewPassword}
              leftElement={
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={colors.placeholderText}
                />
              }
              rightElement={
                <Pressable
                  onPress={() =>
                    toggleShowPasswordVisibility('confirmPassword')
                  }
                  className="p-2"
                >
                  <Ionicons
                    name={
                      getShowPasswords.confirmNewPassword ? 'eye-off' : 'eye'
                    }
                    size={24}
                    color={colors.placeholderText}
                  />
                </Pressable>
              }
            />
          </View>

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
                !formik.values.confirmPassword ||
                !formik.values.oldPassword ||
                !formik.values.newPassword
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
                {formik.isSubmitting
                  ? 'Changing password in...'
                  : 'Change password'}
              </Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </ParallaxScrollView>
  )
}

export default ChangePassword
