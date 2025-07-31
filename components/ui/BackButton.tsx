import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { ThemedText } from '../ThemedText'

const BackButton = ({ title = '' }) => {
  const router = useRouter()
  return (
    <TouchableOpacity
      className="flex-row items-center gap-4"
      onPress={() => {
        router.back()
      }}
    >
      <MaterialIcons name="arrow-back" size={24} />
      <ThemedText type="subtitle">{title}</ThemedText>
    </TouchableOpacity>
  )
}

export default BackButton
