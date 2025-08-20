import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import React from 'react'
import { Text, View } from 'react-native'

const ChangePassword = () => {
  return (
    <ParallaxScrollView>
      <BackButton title={`Change Password`} />
      <View>
        <Text>Change your password</Text>
      </View>
    </ParallaxScrollView>
  )
}

export default ChangePassword
