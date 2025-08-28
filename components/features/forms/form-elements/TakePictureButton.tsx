import useTaskStore from '@/store/tasks'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

interface TakePictureButtonProps {
  label?: string
  onMediaSelect: (mediaData: string | string[]) => void
  value?: string | string[]
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
  task?: any // Add task prop to get taskId
}

const TakePictureButton: React.FC<TakePictureButtonProps> = ({
  label,
  onMediaSelect,
  value,
  error,
  helperText,
  containerStyle,
  required = false,
  task,
}) => {
  const { addPendingImages } = useTaskStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [mediaItems, setMediaItems] = useState<
    { uri: string; type: 'image' | 'video' }[]
  >(() => {
    // Initialize from existing value
    if (Array.isArray(value)) {
      return value.map((filename) => ({
        uri: `file://placeholder/${filename}`, // Placeholder URI for existing files
        type: 'image' as const, // Default to image type
      }))
    } else if (value) {
      return [
        {
          uri: `file://placeholder/${value}`,
          type: 'image' as const,
        },
      ]
    }
    return []
  })

  const addMediaItem = (newMedia: { uri: string; type: 'image' | 'video' }) => {
    const updatedItems = [...mediaItems, newMedia]
    setMediaItems(updatedItems)

    // Add to pending images if we have a task
    if (task?.taskId) {
      const filename =
        newMedia.uri.split('/').pop() || `${newMedia.type}_${Date.now()}`
      addPendingImages({
        taskId: task.taskId,
        name: filename,
        filePath: newMedia.uri,
      })
      console.log('📸 Added image to pending images:', {
        taskId: task.taskId,
        name: filename,
        filePath: newMedia.uri,
      })
    }

    // Return array of all filenames
    const filenames = updatedItems.map(
      (item) => item.uri.split('/').pop() || `${item.type}_${Date.now()}`,
    )
    onMediaSelect(filenames)
    setIsExpanded(false)
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

  const takePhoto = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      addMediaItem({ uri: result.assets[0].uri, type: 'image' })
    }
  }

  const takeVideo = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60, // 60 seconds max
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    })

    if (!result.canceled) {
      addMediaItem({ uri: result.assets[0].uri, type: 'video' })
    }
  }

  const selectImageFromGallery = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      const newItems = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'image' as const,
      }))
      const updatedItems = [...mediaItems, ...newItems]
      setMediaItems(updatedItems)

      // Add each new image to pending images if we have a task
      if (task?.taskId) {
        newItems.forEach((item) => {
          const filename =
            item.uri.split('/').pop() || `${item.type}_${Date.now()}`
          addPendingImages({
            taskId: task.taskId,
            name: filename,
            filePath: item.uri,
          })
          console.log('📸 Added gallery image to pending images:', {
            taskId: task.taskId,
            name: filename,
            filePath: item.uri,
          })
        })
      }

      // Return array of all filenames
      const filenames = updatedItems.map(
        (item) => item.uri.split('/').pop() || `${item.type}_${Date.now()}`,
      )
      onMediaSelect(filenames)
      setIsExpanded(false)
    }
  }

  const selectVideoFromGallery = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      videoMaxDuration: 60,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    })

    if (!result.canceled) {
      const newItems = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'video' as const,
      }))
      const updatedItems = [...mediaItems, ...newItems]
      setMediaItems(updatedItems)

      // Add each new video to pending images if we have a task
      if (task?.taskId) {
        newItems.forEach((item) => {
          const filename =
            item.uri.split('/').pop() || `${item.type}_${Date.now()}`
          addPendingImages({
            taskId: task.taskId,
            name: filename,
            filePath: item.uri,
          })
          console.log('🎥 Added gallery video to pending images:', {
            taskId: task.taskId,
            name: filename,
            filePath: item.uri,
          })
        })
      }

      // Return array of all filenames
      const filenames = updatedItems.map(
        (item) => item.uri.split('/').pop() || `${item.type}_${Date.now()}`,
      )
      onMediaSelect(filenames)
      setIsExpanded(false)
    }
  }

  const mediaOptions = [
    {
      title: 'Take Photo',
      icon: 'camera-alt',
      onPress: takePhoto,
      color: '#241c4c',
    },
    {
      title: 'Take Video',
      icon: 'videocam',
      onPress: takeVideo,
      color: '#241c4c',
    },
    {
      title: 'Select Image',
      icon: 'photo-library',
      onPress: selectImageFromGallery,
      color: '#241c4c',
    },
    {
      title: 'Select Video',
      icon: 'video-library',
      onPress: selectVideoFromGallery,
      color: '#241c4c',
    },
  ]

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: error ? '#EF4444' : '#374151',
            marginBottom: 8,
          }}
        >
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      )}

      {/* Main Media Picker Button - Similar to PrinterButton */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
          backgroundColor: '#241c4c',
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
        }}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="add-a-photo"
          size={16}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 14,
          }}
        >
          Add Media
        </Text>
      </TouchableOpacity>

      {/* Expanded Media Options - 2x2 Grid Layout */}
      {isExpanded && (
        <View
          style={{
            marginTop: 8,
            gap: 6,
          }}
        >
          {/* First Row */}
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
            }}
          >
            {mediaOptions.slice(0, 2).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  backgroundColor: '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  minHeight: 28,
                }}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={option.icon as any}
                  size={12}
                  color={option.color}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: '#374151',
                    fontWeight: '500',
                  }}
                >
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Second Row */}
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
            }}
          >
            {mediaOptions.slice(2, 4).map((option, index) => (
              <TouchableOpacity
                key={index + 2}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  backgroundColor: '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  minHeight: 28,
                }}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={option.icon as any}
                  size={12}
                  color={option.color}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: '#374151',
                    fontWeight: '500',
                  }}
                >
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Helper text or error message */}
      {(error || helperText) && (
        <Text
          style={{
            fontSize: 11,
            color: error ? '#EF4444' : '#6B7280',
            marginTop: 6,
          }}
        >
          {error || helperText}
        </Text>
      )}

      {/* Media Display - Flex Layout */}
      {mediaItems.length > 0 && (
        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {mediaItems.map((media, index) => (
            <View
              key={index}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {media.type === 'image' ? (
                <Image
                  source={{ uri: media.uri }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <MaterialIcons
                    name="play-circle-filled"
                    size={24}
                    color="#241c4c"
                  />
                </View>
              )}

              {/* Remove button */}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  Alert.alert(
                    'Delete Media',
                    'Are you sure you want to remove this media item?',
                    [
                      {
                        text: 'No',
                        style: 'cancel',
                      },
                      {
                        text: 'Yes',
                        style: 'destructive',
                        onPress: () => {
                          const updatedItems = mediaItems.filter(
                            (_, i) => i !== index,
                          )
                          setMediaItems(updatedItems)
                          // Update form value - if no items left, clear the value
                          if (updatedItems.length === 0) {
                            onMediaSelect([])
                          } else {
                            // Return array of all remaining filenames
                            const filenames = updatedItems.map(
                              (item) =>
                                item.uri.split('/').pop() ||
                                `${item.type}_${Date.now()}`,
                            )
                            onMediaSelect(filenames)
                          }
                        },
                      },
                    ],
                  )
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default TakePictureButton
