import { GC_TIME, STALE_TIME } from '@/lib/constants'
import {
  getUser,
  getUserGroupData,
  getUserSettings,
} from '@/services/api/endpoints/user'
import useAuthStore from '@/store/auth'
import useUserInfoStore from '@/store/userInfo'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetUser = () => {
  const queryClient = useQueryClient()
  const { token } = useAuthStore.getState()
  const { userInfo } = useUserInfoStore()
  return useQuery<any, Error>({
    queryKey: ['user', token],
    queryFn: () => getUser(),
    enabled: !!token,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useGetUserGroupData = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()

  return useQuery<any, Error>({
    queryKey: ['userGroups', userInfo],
    queryFn: async () => {
      if (userInfo) {
        const groupNames = userInfo['cognito:groups'] ?? []
        const uniqueGroups = [...new Set(groupNames)]
        const groupDetails = await Promise.all(
          uniqueGroups.map(async (groupName: string) => {
            const group = await getUserGroupData(groupName)
            return group?.[0] ?? null
          }),
        )
        return groupDetails.filter(Boolean)
      }
      return null
    },
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useGetUserSettings = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()
  return useQuery<any, Error>({
    queryKey: ['userSettings', userInfo],
    queryFn: () => getUserSettings(),
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

// export const useUserWithGroups = () => {
//   const userQuery = useGetUser()
//   const groupQuery = useGetUserGroupData()
//   const isLoading = userQuery.isLoading || groupQuery.isLoading
//   const isError = userQuery.isError || groupQuery.isError
//   const error = userQuery.error || groupQuery.error

//   return {
//     user: userQuery.data,
//     groups: groupQuery.data,
//     isLoading,
//     isError,
//     error,
//     refetch: () => {
//       userQuery.refetch()
//       groupQuery.refetch()
//     },
//   }
// }
