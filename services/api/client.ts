// src/api/client.ts
import { API } from '@/constants/api'
import useAuthStore from '@/store/auth'
import useUserInfoStore from '@/store/userInfo'
import axios, { AxiosInstance } from 'axios'

export const client: AxiosInstance = axios.create({
  baseURL: API.BASE_URL.MAIN,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Add request interceptor
client.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState()
    const { userInfo } = useUserInfoStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (userInfo?.tenant) {
      config.headers['x-tenant-name'] = userInfo.tenant
    }
    // console.log('config.headers', config.headers)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
