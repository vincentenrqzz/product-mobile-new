import { API } from '@/constants/api'
import { AxiosResponse } from 'axios'
import { client } from '../client'

export const getUser = async (): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(API.ENDPOINTS.USER.GET)
  return response.data
}

export const getUserGroupData = async (groupId: string): Promise<any> => {
  const getUserGroupEndpoint = API.ENDPOINTS.GROUPS.GET_USER_GROUPS.replace(
    ':id',
    groupId,
  )
  const response: AxiosResponse<any> = await client.get(getUserGroupEndpoint)

  // Check if response.data is a string and looks like HTML
  if (
    typeof response.data === 'string' &&
    response.data.trim().startsWith('<')
  ) {
    return null
  }

  return response.data
}

export const getUserSettings = async (): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.SETTINGS.GET,
  )
  // Check if response.data is a string and looks like HTML
  if (
    typeof response.data === 'string' &&
    response.data.trim().startsWith('<')
  ) {
    return null
  }
  return response.data
}
