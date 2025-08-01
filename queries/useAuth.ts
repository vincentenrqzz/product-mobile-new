import {
  login,
  submitChangePassword,
  submitForgotPassword,
  submitOtp,
  submitResetPassword,
} from '@/services/api/endpoints/auth'
import useAuthStore from '@/store/auth'
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  OtpInput,
  OtpResponse,
  ResetPasswordInput,
} from '@/types/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { setAuthState } = useAuthStore()
  return useMutation<any, Error, { username: string; password: string }>({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: (data, variables) => {
      const { IdToken, ExpiresIn } = data.AuthenticationResult
      setAuthState(true, IdToken)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Failed to login:', error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useSubmitOtp = () => {
  const queryClient = useQueryClient()
  return useMutation<OtpResponse, Error, OtpInput>({
    mutationFn: submitOtp,
    onSuccess: () => {
      // Optionally invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Failed to submit OTP:', error)
      // Optionally show toast
    },
  })
}

export const useSubmitForgotPassword = () => {
  const queryClient = useQueryClient()
  return useMutation<any, Error, ForgotPasswordInput>({
    mutationFn: submitForgotPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Failed to submit forgot password:', error)
      throw new Error('customError') // Preserve original behavior
    },
  })
}

export const useSubmitResetPassword = () => {
  const queryClient = useQueryClient()
  return useMutation<any, Error, ResetPasswordInput>({
    mutationFn: submitResetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Failed to reset password:', error)
      throw new Error('customError') // Preserve original behavior
    },
  })
}

export const useSubmitChangePassword = () => {
  const queryClient = useQueryClient()
  return useMutation<any, Error, ChangePasswordInput>({
    mutationFn: submitChangePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error: any) => {
      if (error.response?.status === 500) {
        return { success: true } // Preserve original behavior
      }
      console.error('Failed to change password:', error)
      throw new Error('customError') // Preserve original behavior
    },
  })
}
