import { API } from '@/constants/api'
import { AxiosResponse } from 'axios'
import { client } from '../client'

export const getSettings = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.SETTINGS.GET,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-request-context': 'tasks',
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
