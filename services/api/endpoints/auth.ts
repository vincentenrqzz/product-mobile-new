import { API } from '@/constants/api'
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  OtpInput,
  ResetPasswordInput,
} from '@/types/auth'
import { AxiosResponse } from 'axios'
import { client } from '../client'

export const login = async (username: string, password: string) => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST,
    { username, password },
  )
  return response.data
}

export const submitOtp = async (params: OtpInput): Promise<any> => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_OTP,
    params,
  )
  return response.data
}

export const submitForgotPassword = async (
  params: ForgotPasswordInput,
): Promise<any> => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_FORGOT_PASSWORD,
    params,
  )
  return response.data
}

export const submitResetPassword = async (
  params: ResetPasswordInput,
): Promise<any> => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_RESET_PASSWORD,
    params,
  )
  return response.data
}

export const submitChangePassword = async (
  params: ChangePasswordInput,
): Promise<any> => {
  const { token, ...rest } = params

  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_CHANGE_PASSWORD,
    rest,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return response.data
}

export const getUser = async (token: string): Promise<any> => {
  if (!token) return

  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.USER.GET,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
