// src/api/client.ts
import useAuthStore from '@/store/auth'
import useUserInfoStore from '@/store/userInfo'
import axios, { AxiosInstance } from 'axios'

export const client: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Add request interceptor
client.interceptors.request.use(
  async (config) => {
    config.baseURL = useAuthStore.getState().baseUrl.MAIN

    const { token } = useAuthStore.getState()
    const { userInfo } = useUserInfoStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (userInfo?.tenant) {
      config.headers['x-tenant-name'] = userInfo.tenant
    }
    // console.log('config.headers', config.headers)
    console.log('config.url', config.baseURL, config.url)

    return config
  },
  (error) => {},
)
