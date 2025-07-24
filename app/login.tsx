import { useAuth } from '@/contexts/AuthContext'
import { useAppTheme } from '@/hooks/useAppTheme'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated'

const Login = () => {
  const [envState, setEnvState] = useState('DEV')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { handleLogin, loginState, isAuthenticated, isLoading } = useAuth()
  const { colors, isDark } = useAppTheme()

  useEffect(() => {
    const loadEnvState = async () => {
      try {
        const storedEnv = await AsyncStorage.getItem('envState')
        if (storedEnv) {
          setEnvState(storedEnv)
        }
      } catch (error) {
        console.log('Error loading envState from AsyncStorage', error)
      }
    }

    loadEnvState()
  }, [])

  useEffect(() => {
    console.log('Login component - Auth state changed:', {
      isAuthenticated,
      isLoading,
    })

    if (isAuthenticated && !isLoading) {
      console.log('User is authenticated, navigating to tabs')
      router.replace('/(tabs)/home')
    }
  }, [isAuthenticated, isLoading])

  const handleEnvSelection = async (env: string) => {
    try {
      setEnvState(env)
      await AsyncStorage.setItem('envState', env)
    } catch (error) {
      console.log('Error saving envState to AsyncStorage', error)
    }
  }

  const onLoginPress = async () => {
    console.log('Login button pressed')
    try {
      await handleLogin(username, password, false)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const onForgotPasswordPress = async () => {
    console.log('Forgot password button pressed')
    // Add your forgot password logic here
    // router.push("/forgot-password");
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View
        className="flex-1 items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <Animated.View
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(300)}
          className="w-full max-w-[400px]"
          style={{ gap: 16 }}
        >
          {/* Logo/Title Section */}
          <Animated.View
            entering={SlideInDown.duration(800).springify()}
            className="mb-6 items-center"
          >
            <Text
              className="font-montserrat-bold text-4xl"
              style={{ color: colors.text }}
            >
              Finito
            </Text>
            <Text
              className="font-montserrat-regular mt-2 text-center"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              Welcome back! Please login to continue.
            </Text>
          </Animated.View>

          {/* Login Form Card */}
          <Animated.View
            entering={FadeIn.duration(700).delay(200)}
            className="mt-20 rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <View style={{ gap: 24 }}>
              {/* Email Input */}
              <View style={{ gap: 8 }}>
                <Text
                  className="font-montserrat-regular text-sm"
                  style={{ color: colors.text }}
                >
                  Email
                </Text>
                <View
                  className={`flex-row items-center rounded-lg border p-3`}
                  style={{
                    backgroundColor: colors.inputBackground,
                    borderColor: loginState.isError
                      ? '#ef4444'
                      : colors.inputBorder,
                  }}
                >
                  <Ionicons
                    name="mail"
                    size={20}
                    color={colors.placeholderText}
                  />
                  <TextInput
                    className="ml-2 flex-1 text-base"
                    style={{
                      color: colors.inputText,
                      fontFamily: 'Inter-Regular',
                    }}
                    placeholder="Enter your email"
                    value={username}
                    onChangeText={setUsername}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loginState.isPending}
                    placeholderTextColor={colors.placeholderText}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{ gap: 8 }}>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Password
                </Text>
                <View
                  className={`flex-row items-center rounded-lg border p-3`}
                  style={{
                    backgroundColor: colors.inputBackground,
                    borderColor: loginState.isError
                      ? '#ef4444'
                      : colors.inputBorder,
                  }}
                >
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={colors.placeholderText}
                  />
                  <TextInput
                    className="ml-2 flex-1 text-base"
                    style={{
                      color: colors.inputText,
                      fontFamily: 'Inter-Regular',
                    }}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loginState.isPending}
                    placeholderTextColor={colors.placeholderText}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loginState.isPending}
                    className="p-2"
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.placeholderText}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Error Message */}
              {loginState.isError && (
                <Animated.View
                  entering={FadeIn.duration(400)}
                  exiting={FadeOut.duration(300)}
                  className="flex-row items-center rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <Ionicons name="warning" size={20} color="#dc2626" />
                  <Text className="ml-2 flex-1 text-sm text-red-600">
                    {loginState.error?.message ||
                      'Login failed. Please try again.'}
                  </Text>
                </Animated.View>
              )}

              {/* Login Button */}
              <Pressable
                onPress={onLoginPress}
                disabled={loginState.isPending || !username || !password}
                className="rounded-lg p-4"
                style={{
                  backgroundColor:
                    loginState.isPending || !username || !password
                      ? `${colors.buttons}80`
                      : colors.buttons,
                }}
              >
                <View className="flex-row items-center justify-center">
                  {loginState.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Ionicons name="log-in" size={20} color="white" />
                  )}
                  <Text className="ml-2 text-lg text-white">
                    {loginState.isPending ? 'Logging in...' : 'Login'}
                  </Text>
                </View>
              </Pressable>

              {/* Forgot Password Link */}
              <Pressable
                onPress={onForgotPasswordPress}
                disabled={loginState.isPending}
                className="rounded-lg border p-3"
                style={{ borderColor: colors.inputBorder }}
              >
                <Text
                  className="text-center text-sm"
                  style={{ color: colors.text, opacity: 0.7 }}
                >
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Environment Selector (Optional) */}
          {__DEV__ && (
            <Animated.View
              entering={FadeIn.duration(500).delay(400)}
              className="mt-4 flex-row justify-center opacity-70"
              style={{ gap: 8 }}
            >
              {['DEV', 'STAGING', 'PROD'].map((env) => (
                <Pressable
                  key={env}
                  onPress={() => handleEnvSelection(env)}
                  className={`rounded-md px-3 py-1`}
                  style={{
                    backgroundColor:
                      envState === env ? colors.buttons : 'transparent',
                    borderWidth: envState === env ? 0 : 1,
                    borderColor: colors.inputBorder,
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: envState === env ? '#FFFFFF' : colors.text,
                    }}
                  >
                    {env}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Login
