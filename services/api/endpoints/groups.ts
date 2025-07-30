import { API } from '@/constants/api'
import { AxiosResponse } from 'axios'
import { client } from '../client'

export const getGroupsUser = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.GROUPS.GET_USER_GROUPS,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
