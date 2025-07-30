import { StyleSheet, View } from 'react-native'

import { HelloWave } from '@/components/HelloWave'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import AppLogo from '@/components/ui/AppLogo'
import { useGetUserGroupData } from '@/queries/useUserInfo'
import useUserInfoStore from '@/store/userInfo'
import { useEffect } from 'react'

export default function Home() {
  const { userInfo, userSettings, setUserGroup } = useUserInfoStore()
  const matchLogo = userSettings?.find((item) => item.key === 'tenantLogo')
  const {
    data: userGroup,
    isLoading: userGroupIsLoading,
    isError: userGroupIsError,
  } = useGetUserGroupData()

  useEffect(() => {
    if (userGroup) {
      setUserGroup(userGroup)
    }
  }, [userGroup])
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerContent={<AppLogo />}
    >
      <View style={styles.titleContainer}>
        <ThemedText type="title">
          Hello {`${userInfo?.name} ${userInfo?.family_name}`}
        </ThemedText>
        <HelloWave />
      </View>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})
