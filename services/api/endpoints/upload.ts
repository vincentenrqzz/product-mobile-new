import { API } from '@/constants/api'
import useUserInfoStore from '@/store/userInfo'
import { FileData, FileUploadResponse } from '@/types/file'
import { AxiosProgressEvent, AxiosResponse } from 'axios'
import { client } from '../client'
import { fileClient } from '../fileClient'

export const uploadFile = async (
  taskIdAndFilePath: string,
  fileData: FileData,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void,
): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append('destination', taskIdAndFilePath)
  formData.append('image', fileData as any)
  console.log('formData', formData)
  const response: AxiosResponse<FileUploadResponse> = await fileClient.post(
    API.ENDPOINTS.FILES.POST,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal,
      timeout: 120000,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        console.log('progressEvent', progressEvent)
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          )
          onProgress(percent)
        }
      },
    },
  )

  return response.data
}

export const getImageFromAmazon = async (
  taskId: number,
  filename: string,
  fromTakePicture?: string,
) => {
  try {
    const settings = useUserInfoStore.getState().userSettings
    if (fromTakePicture && settings.length === 0) {
      return 'network error'
    }
    const getBucketName = settings.find((item) => {
      return item.key == 'bucketName'
    })
    const getRegion = settings.find((item) => {
      return item.key == 's3Region'
    })

    const presignedUrl = `https://${getBucketName?.value}.s3.${getRegion?.value}.amazonaws.com/task/${taskId}/${filename}`

    const response = await client.post(
      API.ENDPOINTS.AMAZON.POST,
      { filePath: presignedUrl }, // request body
      {
        headers: {
          'Content-Type': 'application/json',
          'x-request-context': 'tasks',
        },
      },
    )

    return await response.data
  } catch (error) {
    return {}
  }
}

import axios from 'axios'

export const getVideoFromAmazon = async (
  taskId: number,
  filename: string,
  fromTakePicture?: string,
) => {
  try {
    const settings = useUserInfoStore.getState().userSettings
    if (fromTakePicture && settings.length === 0) {
      return 'network error'
    }

    const getBucketName = settings.find((item) => item.key === 'bucketName')
    const getRegion = settings.find((item) => item.key === 's3Region')

    const presignedUrl = `https://${getBucketName?.value}.s3.${getRegion?.value}.amazonaws.com/task/${taskId}/${filename}`

    const response = await client.post(
      API.ENDPOINTS.AMAZON.POST,
      { filePath: presignedUrl },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds
      },
    )

    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:')
      console.error('Message:', error.message)
      // if (error.response) {
      //   console.error('Status:', error.response.status)
      //   console.error('Response data:', error.response.data)
      //   console.error('Headers:', error.response.headers)
      // } else if (error.request) {
      //   console.error('No response received:', error.request)
      // } else {
      //   console.error('Error config:', error.config)
      // }
    } else {
      // console.error('Unexpected error:', error)
    }

    return {}
  }
}
