import useAuthStore from '@/store/auth'
import useUserInfoStore from '@/store/userInfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { client } from './client'
import { fileClient } from './fileClient'

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
    console.log('config.headers', config.headers)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
fileClient.interceptors.request.use(async (config) => {
  const tenant = await AsyncStorage.getItem('tenant')
  if (tenant) {
    config.headers['x-tenant-name'] = tenant
  }
  return config
})
