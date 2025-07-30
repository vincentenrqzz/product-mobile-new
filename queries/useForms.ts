import { GC_TIME, STALE_TIME } from '@/lib/utils'
import { getForms } from '@/services/api/endpoints/forms'
import useUserInfoStore from '@/store/userInfo'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetForms = () => {
  const queryClient = useQueryClient()
  const { userInfo } = useUserInfoStore.getState()
  return useQuery<any, Error>({
    queryKey: ['forms', userInfo],
    queryFn: () => getForms(),
    enabled: !!userInfo,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}
