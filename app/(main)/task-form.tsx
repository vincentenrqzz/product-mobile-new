import CheckboxGroup from '@/components/features/forms/formElements/CheckboxGroup'
import DatePickerButton from '@/components/features/forms/formElements/DatePickerButton'
import SimpleDateTimePicker from '@/components/features/forms/formElements/SimpleDateTimePicker'
import RadioGroup from '@/components/features/forms/formElements/RadioGroup'
import SingleText from '@/components/features/forms/formElements/SingleText'
import SubmitButton from '@/components/features/forms/formElements/SubmitButton'
import TextForm from '@/components/features/forms/formElements/TextForm'
// import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { Task } from '@/store/tasks'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native'

const TaskForm = () => {
  // builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task, fromListItemTab, statusLabels } = params

  // parse task param
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([])
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(
    undefined,
  )

  const handleSubmit = async () => {
    if (!inputValue.trim() && !textareaValue.trim()) {
      alert('Please fill in at least one field before submitting.')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would typically send data to your API
      console.log('Form submitted:', {
        title: inputValue,
        description: textareaValue,
        imageUri,
      })

      alert('Form submitted successfully!')

      // Reset form
      setInputValue('')
      setTextareaValue('')
      setImageUri(null)
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <View style={{ flex: 1, backgroundColor: '#F7F9FA' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <BackButton title="Task Forms" />

        <Text style={styles.title}>TaskForm</Text>

        {/* Test with basic TextInput first */}

        <SingleText
          label="Test Input"
          placeholder="Enter some text..."
          value={inputValue}
          onChangeText={setInputValue}
        />

        <TextForm
          label="Description"
          placeholder="Enter a detailed description..."
          value={textareaValue}
          onChangeText={setTextareaValue}
          minHeight={120}
          maxHeight={300}
        />

        <CheckboxGroup
          label="Select Features"
          options={[
            { id: '1', label: 'Push Notifications', value: 'notifications' },
            { id: '2', label: 'Dark Mode', value: 'darkmode' },
            { id: '3', label: 'Offline Mode', value: 'offline' },
          ]}
          selectedValues={selectedCheckboxes}
          onSelectionChange={setSelectedCheckboxes}
        />

        <RadioGroup
          label="Enable Analytics?"
          options={[
            { id: '1', label: 'Yes', value: 'yes' },
            { id: '2', label: 'No', value: 'no' },
          ]}
          selectedValue={selectedRadio}
          onSelectionChange={setSelectedRadio}
        />

        <DatePickerButton
          label="Select Date"
          placeholder="Choose a date"
          onDateSelect={setSelectedDate}
        />

        <SimpleDateTimePicker
          label="Pick Date & Time"
          placeholder="Choose date and time"
          value={selectedDateTime}
          onDateTimeChange={setSelectedDateTime}
        />

        {/* Debug display to show current input values */}
        {(inputValue ||
          textareaValue ||
          selectedCheckboxes.length > 0 ||
          selectedRadio ||
          selectedDate ||
          selectedDateTime) && (
          <View
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#E5F3FF',
              borderRadius: 8,
            }}
          >
            {inputValue && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                  marginBottom: 8,
                }}
              >
                Single Input: &quot;{inputValue}&quot;
              </Text>
            )}
            {textareaValue && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                  marginBottom: 8,
                }}
              >
                Textarea: &quot;{textareaValue}&quot;
              </Text>
            )}
            {selectedCheckboxes.length > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                  marginBottom: 8,
                }}
              >
                Selected Features: {selectedCheckboxes.join(', ')}
              </Text>
            )}
            {selectedRadio && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                  marginBottom: 8,
                }}
              >
                Analytics: {selectedRadio}
              </Text>
            )}
            {selectedDate && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                  marginBottom: 8,
                }}
              >
                Selected Date: {selectedDate}
              </Text>
            )}
            {selectedDateTime && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                }}
              >
                DateTime Picker: {selectedDateTime.toISOString()}
              </Text>
            )}
          </View>
        )}

        <SubmitButton
          title="Outline Button"
          onPress={() => alert('Outline button pressed!')}
          variant="outline"
          size="medium"
          containerStyle={{ marginBottom: 16 }}
        />

        {/* <View style={styles.buttonGroup}>
          <Button
            title="Pick Image from Gallery"
            onPress={pickImageFromLibrary}
          />
          <View style={{ marginVertical: 8 }} />
          <Button title="Take Photo with Camera" onPress={takePhotoWithCamera} />
        </View> */}

        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      </ScrollView>
    </View>
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
