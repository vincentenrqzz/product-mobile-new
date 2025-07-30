import LoginForm from '@/components/features/login/LoginForm'
import { useAppTheme } from '@/hooks/useAppTheme'
import { useLogin } from '@/queries/useAuth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated'

export default function login() {
  const [envState, setEnvState] = useState('DEV')
  const { colors, isDark } = useAppTheme()
  const router = useRouter()
  const onLogin = useLogin()

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

  const handleEnvSelection = async (env: string) => {
    try {
      setEnvState(env)
      await AsyncStorage.setItem('envState', env)
    } catch (error) {
      console.log('Error saving envState to AsyncStorage', error)
    }
  }

  const onLoginPress = async (values: any, actions: any) => {
    await onLogin
      .mutateAsync({
        username: values.email,
        password: values.password,
      })
      .then((data) => {
        setTimeout(() => {
          router.replace('/(main)/(tabs)/home')
        }, 100)
      })
      .catch((error) => {
        console.log('error', error)
        const isNetworkError = error.message?.toLowerCase() === 'network error'
        actions.setFieldError(
          'customError',
          isNetworkError || 'Login failed. Please try again.',
        )
      })
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
          className="w-full max-w-[400px] gap-16"
          // style={{ gap: 16 }}
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
              className="mt-2 text-center font-montserrat-regular"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              Welcome back! Please login to continue.
            </Text>
          </Animated.View>

          <LoginForm
            onLoginPress={onLoginPress}
            onForgotPasswordPress={onForgotPasswordPress}
          />

          {/* Environment Selector (Optional) */}
          {__DEV__ && (
            <Animated.View
              entering={FadeIn.duration(500).delay(400)}
              className="mt-4 flex-row justify-center opacity-70"
              style={{ gap: 8 }}
            >
              {['DEV', 'STAGING', 'QA', 'PROD'].map((env) => (
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
