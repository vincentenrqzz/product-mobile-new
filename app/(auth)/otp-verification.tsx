import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { useAppTheme } from '@/hooks/useAppTheme'
import { useLogin, useSubmitOtp } from '@/queries/useAuth'
import useAuthStore from '@/store/auth'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { useLocalSearchParams, useRouter } from 'expo-router'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { OtpInput } from 'react-native-otp-entry'
import Animated, { FadeIn } from 'react-native-reanimated'

const timeFormat = 'DD-MM-YYYY HH:mm:ss'

const OtpVerification = () => {
  //built-in
  const router = useRouter()
  const { setAuthState } = useAuthStore()

  //params
  const params = useLocalSearchParams()
  const { userSub, tenantName, resendSeconds, email, password } = params
  console.log('params', params)
  const parsedResendSeconds: number = Array.isArray(resendSeconds)
    ? parseInt(resendSeconds[0]) // use the first value if it's an array
    : parseInt(resendSeconds)
  const parsedTenantName = Array.isArray(tenantName)
    ? tenantName[0]
    : tenantName || ''
  const parsedUserSub = Array.isArray(userSub) ? userSub[0] : userSub || ''
  const parsedEmail = Array.isArray(email) ? email[0] : email || ''
  const parsedPassword = Array.isArray(password) ? password[0] : password || ''

  //store
  const { colors } = useAppTheme()
  const submitOtp = useSubmitOtp()
  const onLogin = useLogin()

  //state
  const [otp, setOtp] = useState('')
  const [backgroundTimer, setBackgroundTimer] = useState(
    parsedResendSeconds + 1,
  )

  const [resendOtpTimeStart, setOtpTimeIn] = useState('')
  const [loading, setLoading] = useState(false)
  const isTimerDone = () => backgroundTimer >= parsedResendSeconds
  console.log('timerNotDones', !isTimerDone())
  console.log('backgroundTimer', backgroundTimer)
  console.log('parsedResendSeconds', parsedResendSeconds)

  const timerNotDone = !isTimerDone()
  const timeRemaining = parsedResendSeconds - backgroundTimer

  //functions
  const onSubmitOtp = async () => {
    const params = {
      tenantName: parsedTenantName,
      userSub: parsedUserSub,
      code: otp,
    }
    setLoading(true)
    submitOtp
      .mutateAsync(params)
      .then((data: any) => {
        console.log('Data', data)
        const { IdToken, ExpiresIn } = data.AuthenticationResult
        setAuthState(true, IdToken)
        setTimeout(() => {
          router.replace('/(main)/(tabs)/home')
        }, 100)
      })
      .catch((error) => {
        console.log('Error OTP code')
        if (axios.isAxiosError(error)) {
          if (error.code === '400') {
            if (error.message === 'OTP expired') {
              Alert.alert('otpExpired')
            } else {
              Alert.alert('otpIncorrect')
            }
          }
        } else {
          Alert.alert('otpError')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }
  const onResendOtp = async () => {
    const timerNotDone = !isTimerDone()
    if (timerNotDone) return
    ;``

    setLoading(true)
    await onLogin
      .mutateAsync({
        username: parsedEmail,
        password: parsedPassword,
      })
      .then((data) => {
        if (data?.enableOtp) {
          const { resendSeconds } = data
          setBackgroundTimer(parseInt(resendSeconds || 180) + 1)
        } else {
          const { IdToken, ExpiresIn } = data.AuthenticationResult
          setAuthState(true, IdToken)
          setTimeout(() => {
            router.replace('/(main)/(tabs)/home', { shallow: true })
          }, 100)
        }
      })
      .catch((error) => {
        Alert.alert('Resend Otp Failed')
      })
      .finally(() => {
        const getResendOTPTimeStart = moment().format(timeFormat)
        setOtpTimeIn(getResendOTPTimeStart)
        setBackgroundTimer(0)
        setLoading(false)
      })
  }

  //effects
  useEffect(() => {
    const timerDone = isTimerDone()

    if (timerDone) return

    setTimeout(
      (timeStart) => {
        const timeNow = moment().format(timeFormat)
        const timePassed = moment(timeNow).diff(timeStart)
        const difference = moment.duration(timePassed)
        console.log('difference.asSeconds()', difference.asSeconds())
        setBackgroundTimer(difference.asSeconds())
      },
      1000,
      resendOtpTimeStart,
    )
  }, [backgroundTimer, resendSeconds, resendOtpTimeStart])

  console.log(':timerNotDone', timerNotDone)
  return (
    <ParallaxScrollView>
      <View className="flex-1 items-center justify-center">
        <Animated.View
          entering={FadeIn.duration(700).delay(200)}
          className="mt-20 gap-10 rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: colors.cardBackground }}
        >
          <BackButton title={`Otp Verification`} />
          <Text className="text-lg text-gray-500">
            Please type the verification code that is sent to your account
          </Text>
          <View className="gap-4">
            <OtpInput
              numberOfDigits={6}
              focusColor="green"
              autoFocus={false}
              hideStick={true}
              placeholder="******"
              blurOnFilled={true}
              disabled={false}
              type="alphanumeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              onFocus={() => console.log('Focused')}
              onBlur={() => console.log('Blurred')}
              onTextChange={(text) => console.log(text)}
              onFilled={async (text) => {
                // await onSubmitOtp()
                setOtp(text)
              }}
              textInputProps={{
                accessibilityLabel: 'One-Time Password',
              }}
              textProps={{
                accessibilityRole: 'text',
                accessibilityLabel: 'OTP digit',
                allowFontScaling: false,
              }}
              //   theme={{
              //     containerStyle: styles.container,
              //     pinCodeContainerStyle: styles.pinCodeContainer,
              //     pinCodeTextStyle: styles.pinCodeText,
              //     focusStickStyle: styles.focusStick,
              //     focusedPinCodeContainerStyle: styles.activePinCodeContainer,
              //     placeholderTextStyle: styles.placeholderText,
              //     filledPinCodeContainerStyle: styles.filledPinCodeContainer,
              //     disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
              //   }}
            />

            <TouchableOpacity
              className="items-end justify-end "
              disabled={loading || timerNotDone}
              onPress={onResendOtp}
            >
              <Text className="text-lg font-bold">
                {timerNotDone ? `${timeRemaining} seconds` : ' Resend Otp '}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Login Button */}
          <Pressable
            onPress={onSubmitOtp}
            disabled={loading}
            className="rounded-lg p-4"
            style={{
              backgroundColor: loading ? `${colors.buttons}80` : colors.buttons,
            }}
          >
            <View className="flex-row items-center justify-center">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="log-in" size={20} color="white" />
              )}
              <Text className="ml-2 text-lg text-white">
                {loading ? 'Verifting otp...' : ' Verify Otp'}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </ParallaxScrollView>
  )
}

export default OtpVerification
