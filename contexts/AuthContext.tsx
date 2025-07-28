import { useLogin, useSubmitOtp } from '@/queries/useAuth'
import useAuthStore from '@/store/auth'
import { OtpChallenge } from '@/types/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  loginState: {
    isPending: boolean
    isError: boolean
    error: any
  }
  handleLogin: (
    username: string,
    password: string,
    useBiometrics: boolean,
  ) => Promise<void | { errorCode: number }>
  handleLogout: () => Promise<void>
  checkAuthState: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuthStore()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [otpChallenge, setOtpChallenge] = useState<null | OtpChallenge>(null)
  const [userData, setUserData] = useState(null)

  const router = useRouter()
  const onLogin = useLogin()
  const onSubmitOtp = useSubmitOtp()

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('IdToken')
      if (token) {
        // Optionally validate token here (check expiration, etc.)
        // For now, we'll assume if token exists, user is authenticated
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (
    username: string,
    password: string,
    useBiometrics: boolean,
  ) => {
    const networkError = { errorCode: 2 }
    const credentialsError = { errorCode: 1 }

    try {
      console.log('Starting login...')
      let data
      if (!useBiometrics) {
        const response = await onLogin.mutateAsync({
          username,
          password,
        })

        data = response
        // Keychain here
      } else {
        const response = await onLogin.mutateAsync({
          username,
          password,
        })
        data = response
      }

      if (data.enableOtp) {
        setCredentials({ username, password })
        const { userSub, tenantName, resendSeconds } = data
        return setOtpChallenge({
          userSub,
          tenantName,
          code: '',
          resendSeconds,
        })
      }

      if (!data.AuthenticationResult)
        throw new Error('No AuthenticationResult in response')

      const { IdToken, ExpiresIn } = data.AuthenticationResult
      await AsyncStorage.setItem('IdToken', IdToken)

      console.log('Token saved, setting authenticated to true')
      setIsAuthenticated(true)

      console.log('Attempting navigation to tabs')
    } catch (error: any) {
      setCredentials({ username: '', password: '' })
      setOtpChallenge(null)
      setIsAuthenticated(false)
      console.error('Login failed:', error)
      const isNetworkError = error.message?.toLowerCase() === 'network error'
      return isNetworkError ? networkError : credentialsError
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await AsyncStorage.removeItem('IdToken')
      setIsAuthenticated(false)
      router.replace('/login')
      setIsLoading(false)
    } catch (error) {
      console.error('Error during logout:', error)
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    return await onLogin.mutateAsync({
      username: credentials.username,
      password: credentials.password,
    })
  }

  const handleSubmitOtp = async (params: {
    tenantName: string
    userSub: string
    code: string
  }) => {
    const hasError = { error: true }

    try {
      const { data } = await onSubmitOtp.mutateAsync({
        tenantName: params.tenantName,
        userSub: params.userSub,
        code: params.code,
      })

      if (!data.AuthenticationResult) {
        return hasError
      }

      const IdToken = data.AuthenticationResult.IdToken
      await AsyncStorage.setItem('IdToken', IdToken)
      setIsAuthenticated(true)
      router.replace('/(tabs)/home')
    } catch (error: any) {
      return { ...error.response.data, error: true }
    }
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    loginState: {
      isPending: onLogin.isPending,
      isError: onLogin.isError,
      error: onLogin.error,
    },
    handleLogin,
    handleLogout,
    checkAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
