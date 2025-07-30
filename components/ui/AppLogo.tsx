import useUserInfoStore from '@/store/userInfo'
import { Image } from 'expo-image'
import React from 'react'

const AppLogo = () => {
  const { userSettings } = useUserInfoStore()
  const matchLogo = userSettings?.find((item) => item.key === 'tenantLogo')

  // Determine the source of the image
  const imageSource = matchLogo?.value
    ? { uri: matchLogo.value }
    : require('@/assets/images/partial-react-logo.png')

  return (
    <Image
      source={imageSource} // Correctly use the source prop
      style={{ width: 100, height: 75 }}
      contentFit="contain"
    />
  )
}

export default AppLogo
