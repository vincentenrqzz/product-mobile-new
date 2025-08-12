import { API } from '@/constants/api'
import useAuthStore from '@/store/auth'
import useUserInfoStore from '@/store/userInfo'
import axios, { AxiosInstance } from 'axios'

export const fileClient: AxiosInstance = axios.create({
  baseURL: API.BASE_URL.FILE,
  headers: {
    'x-request-context': 'mobile',
  },
})

// ✅ Add request interceptor
fileClient.interceptors.request.use(
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
    console.log(`${config.baseURL}${config.url}`)

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
