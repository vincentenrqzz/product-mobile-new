import { API } from '@/constants/api'
import { AxiosResponse } from 'axios'
import { client } from '../client'

export const getTaskTypes = async (): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.TASK_TYPES.GET,
    {
      headers: {
        'x-request-context': 'tasks',
      },
    },
  )
  console.log('response.data', response.data)
  // Check if response.data is a string and looks like HTML
  if (
    typeof response.data === 'string' &&
    response.data.trim().startsWith('<')
  ) {
    return null
  }
  return response.data
}
