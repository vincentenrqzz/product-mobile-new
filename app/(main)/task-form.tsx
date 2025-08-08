import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { Task } from '@/store/tasks'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Button, Image, StyleSheet, Text, View } from 'react-native'

const TaskForm = () => {
  // builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task, fromListItemTab, statusLabels } = params

  // parse task param
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)

  const [imageUri, setImageUri] = useState<string | null>(null)

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permission denied',
        'Camera and media library permissions are required.',
      )
      return false
    }
    return true
  }

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  return (
    <ParallaxScrollView>
      <BackButton title="Task Forms" />

      <Text style={styles.title}>TaskForm</Text>

      <View style={styles.buttonGroup}>
        <Button
          title="Pick Image from Gallery"
          onPress={pickImageFromLibrary}
        />
        <View style={{ marginVertical: 8 }} />
        <Button title="Take Photo with Camera" onPress={takePhotoWithCamera} />
      </View>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
  },
  buttonGroup: {
    marginHorizontal: 16,
  },
  image: {
    marginTop: 20,
    alignSelf: 'center',
    width: 300,
    height: 200,
    borderRadius: 10,
  },
})

export default TaskForm
