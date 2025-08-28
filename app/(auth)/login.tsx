import LoginForm from '@/components/features/login/LoginForm'
import BubbleBackground from '@/components/ui/BubbleBackground'
import { BASE_URLS } from '@/constants/api'
import { useAppTheme } from '@/hooks/useAppTheme'
import { useLogin } from '@/queries/useAuth'
import useAuthStore from '@/store/auth'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Animated, {
  FadeIn,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Login() {
  const { setEnvState, SetBaseUrl, envState } = useAuthStore()
  const { isDark } = useAppTheme()
  const router = useRouter()
  const onLogin = useLogin()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // const { pendingTasks } = useTaskStore()
  useEffect(() => {
    const loadEnvState = async () => {
      try {
        const storedEnv = await AsyncStorage.getItem('envState')
        if (storedEnv) {
          setEnvState(storedEnv)
        }
      } catch {
        // console.log('Error loading envState from AsyncStorage')
      }
    }

    loadEnvState()
  }, [setEnvState])

  const handleEnvSelection = async (env: 'DEV' | 'STAGING' | 'QA' | 'PROD') => {
    try {
      setEnvState(env)
      if (env === 'DEV') {
        SetBaseUrl(BASE_URLS.dev)
      }
      if (env === 'STAGING') {
        SetBaseUrl(BASE_URLS.dev)
      }
      if (env === 'QA') {
        SetBaseUrl(BASE_URLS.qa)
      }
      if (env === 'PROD') {
        SetBaseUrl(BASE_URLS.prod)
      }
      await AsyncStorage.setItem('envState', env)
    } catch {
      // console.log('Error saving envState to AsyncStorage')
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
        // console.log('error', error)
        const isNetworkError = error.message?.toLowerCase() === 'network error'
        actions.setFieldError(
          'customError',
          isNetworkError || 'Login failed. Please try again.',
        )
      })
  }

  const onForgotPasswordPress = async () => {
    // console.log('Forgot password button pressed')
    // Add your forgot password logic here
    // router.push("/forgot-password");
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? '#111827' : '#F9FAFB' },
        ]}
      >
        {/* Status Bar */}
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        {/* Animated Bubble Background */}
        <BubbleBackground isDark={isDark} />

        <SafeAreaView style={styles.safeArea}>
          {/* Environment Dropdown in top right (Dev Only) */}
          {__DEV__ && (
            <View style={styles.topRightContainer}>
              <Pressable
                onPress={() => setIsDropdownOpen(true)}
                style={[
                  styles.envDropdownTrigger,
                  {
                    backgroundColor: isDark
                      ? 'rgba(55, 65, 81, 0.8)'
                      : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark
                      ? 'rgba(156, 163, 175, 0.3)'
                      : 'rgba(209, 213, 219, 0.8)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.envDropdownText,
                    { color: isDark ? '#E5E7EB' : '#374151' },
                  ]}
                >
                  {envState}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </Pressable>

              {/* Environment Selection Modal */}
              <Modal
                visible={isDropdownOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDropdownOpen(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setIsDropdownOpen(false)}
                >
                  <View style={styles.modalContent}>
                    <View
                      style={[
                        styles.dropdownMenu,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                          borderColor: isDark
                            ? 'rgba(156, 163, 175, 0.2)'
                            : 'rgba(209, 213, 219, 0.8)',
                        },
                      ]}
                    >
                      {['DEV', 'STAGING', 'QA', 'PROD'].map((env, index) => (
                        <Pressable
                          key={env}
                          onPress={() => {
                            handleEnvSelection(
                              env as 'DEV' | 'STAGING' | 'QA' | 'PROD',
                            )
                            setIsDropdownOpen(false)
                          }}
                          style={[
                            styles.dropdownItem,
                            {
                              backgroundColor:
                                envState === env
                                  ? isDark
                                    ? '#4F46E5'
                                    : '#EEF2FF'
                                  : 'transparent',
                              borderBottomWidth: index < 3 ? 1 : 0,
                              borderBottomColor: isDark
                                ? 'rgba(156, 163, 175, 0.2)'
                                : 'rgba(229, 231, 235, 0.8)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              {
                                color:
                                  envState === env
                                    ? isDark
                                      ? '#FFFFFF'
                                      : '#4F46E5'
                                    : isDark
                                      ? '#E5E7EB'
                                      : '#374151',
                              },
                            ]}
                          >
                            {env}
                          </Text>
                          {envState === env && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={isDark ? '#FFFFFF' : '#4F46E5'}
                            />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </Pressable>
              </Modal>
            </View>
          )}

          {/* Simple centered content */}
          <View style={styles.centerContainer}>
            {/* Simple Logo Display */}
            <Animated.View
              entering={SlideInDown.duration(800)
                .springify()
                .damping(15)
                .stiffness(100)}
              style={styles.logoSection}
            >
              <Image
                source={require('@/assets/images/finito_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              entering={SlideInUp.duration(600).delay(200)}
              style={styles.formSection}
            >
              <LoginForm
                onLoginPress={onLoginPress}
                onForgotPasswordPress={onForgotPasswordPress}
              />
            </Animated.View>

            {/* Version Display */}
            <Animated.View
              entering={FadeIn.duration(400).delay(400)}
              style={styles.versionContainer}
            >
              <Text
                style={[
                  styles.versionText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                v1.9.90
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topRightContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 110,
    right: 20,
    zIndex: 1000,
  },
  envDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  envDropdownText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 120 : 130,
    paddingRight: 20,
  },
  modalContent: {
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 64,
  },
  logo: {
    width: 320,
    height: 107,
  },
  formSection: {
    marginBottom: 32,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    opacity: 0.7,
  },
})
