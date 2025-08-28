import FormInput from '@/components/ui/formik/FormInput'
import { useAppTheme } from '@/hooks/useAppTheme'
import { loginSchemas } from '@/schemas/loginSchemas'
import { Ionicons } from '@expo/vector-icons'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

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

  // Gradient colors matching task-detail.tsx
  const gradientColors = isDark ? ['#667EEA', '#764BA2'] : ['#4F46E5', '#7C3AED']

  const initialValues: InitialValues = {
    email: '',
    password: '',
  }

  const formik = useFormik({
    initialValues,
    onSubmit: onLoginPress,
    validationSchema: loginSchemas,
  })

  const isButtonDisabled = formik.isSubmitting || !formik.values.email || !formik.values.password

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#374151' }]}>
          Email
        </Text>
        <FormInput
          formik={formik}
          name="email"
          placeholder="Enter your email"
          keyboardType="email-address"
          leftElement={
            <Ionicons 
              name="mail" 
              size={20} 
              color={isDark ? '#9CA3AF' : '#6B7280'} 
            />
          }
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#374151' }]}>
          Password
        </Text>
        <FormInput
          formik={formik}
          name="password"
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          leftElement={
            <Ionicons
              name="lock-closed"
              size={20}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          }
          rightElement={
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? '#9CA3AF' : '#6B7280'}
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
          style={[
            styles.errorContainer,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 1)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(252, 165, 165, 1)',
            }
          ]}
        >
          <Ionicons name="warning" size={20} color="#DC2626" />
          <Text style={styles.errorText}>
            {formik.errors.customError || 'Login failed. Please try again.'}
          </Text>
        </Animated.View>
      )}

      {/* Login Button */}
      <Pressable
        onPress={() => formik.handleSubmit()}
        disabled={isButtonDisabled}
        style={[styles.loginButton, { opacity: isButtonDisabled ? 0.6 : 1 }]}
      >
        <LinearGradient
          colors={isButtonDisabled ? ['#9CA3AF', '#6B7280'] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <View style={styles.buttonContent}>
            {formik.isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="log-in" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>

      {/* Forgot Password Link */}
      <Pressable
        onPress={onForgotPasswordPress}
        disabled={formik.isSubmitting}
        style={styles.forgotPasswordContainer}
      >
        <Text style={[styles.forgotPasswordText, { color: gradientColors[0] }]}>
          Forgot Password?
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  eyeButton: {
    padding: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontFamily: 'Montserrat-Regular',
  },
  loginButton: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    minWidth: 120,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    opacity: 0.7,
  },
})

export default LoginForm
