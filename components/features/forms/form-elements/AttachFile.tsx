import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

interface AttachFileProps {
  label?: string
  onFileSelect: (files: { name: string; uri: string; type: string; size: number }[]) => void
  selectedFiles?: { name: string; uri: string; type: string; size: number }[]
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
  maxFileSize?: number // in MB
}

const AttachFile: React.FC<AttachFileProps> = ({
  label,
  onFileSelect,
  selectedFiles = [],
  error,
  helperText,
  containerStyle,
  required = false,
  maxFileSize = 5,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        return
      }

      const maxSizeBytes = maxFileSize * 1024 * 1024
      const validFiles = []
      const oversizedFiles = []

      // Handle both single and multiple file results
      const assets = Array.isArray(result.assets) ? result.assets : [result.assets].filter(Boolean)

      for (const file of assets) {
        if (file.size && file.size > maxSizeBytes) {
          oversizedFiles.push(file.name)
        } else {
          validFiles.push({
            name: file.name || 'Unknown file',
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            size: file.size || 0,
          })
        }
      }

      if (oversizedFiles.length > 0) {
        Alert.alert(
          'File Size Limit Exceeded',
          `The following files exceed the ${maxFileSize}MB limit:\n${oversizedFiles.join(', ')}\n\nOnly valid files will be attached.`
        )
      }

      if (validFiles.length > 0) {
        const updatedFiles = [...selectedFiles, ...validFiles]
        onFileSelect(updatedFiles)
        setIsExpanded(false)
      }
    } catch (err) {
      console.error('File picker error:', err)
      Alert.alert('Error', 'Failed to pick file. Please try again.')
    }
  }

  const removeFile = (index: number) => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            const updatedFiles = selectedFiles.filter((_, i) => i !== index)
            onFileSelect(updatedFiles)
          },
        },
      ]
    )
  }

  const clearAllFiles = () => {
    Alert.alert(
      'Clear All Files',
      'Are you sure you want to remove all attached files?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            onFileSelect([])
          },
        },
      ]
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const fileActions = [
    {
      title: 'Select Files',
      icon: 'attach-file',
      onPress: pickFile,
      color: '#241c4c',
    },
    {
      title: 'Clear All',
      icon: 'clear-all',
      onPress: clearAllFiles,
      color: '#EF4444',
      disabled: selectedFiles.length === 0,
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

      {/* AttachFile Button - Similar to TakePictureButton */}
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
          name="attach-file"
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
          Attach Files
        </Text>
      </TouchableOpacity>

      {/* Expanded File Actions */}
      {isExpanded && (
        <View
          style={{
            marginTop: 8,
            gap: 6,
          }}
        >
          {/* File Actions Row */}
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
            }}
          >
            {fileActions.map((action, index) => (
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
                  backgroundColor: action.disabled ? '#F9FAFB' : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  minHeight: 28,
                  opacity: action.disabled ? 0.5 : 1,
                }}
                onPress={action.onPress}
                activeOpacity={action.disabled ? 1 : 0.7}
                disabled={action.disabled}
              >
                <MaterialIcons
                  name={action.icon as any}
                  size={12}
                  color={action.color}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: '#374151',
                    fontWeight: '500',
                  }}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <View
          style={{
            marginTop: 12,
            gap: 8,
          }}
        >
          {selectedFiles.map((file, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#241c4c15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <MaterialIcons
                  name="description"
                  size={16}
                  color="#241c4c"
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {file.name}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#6B7280',
                  }}
                >
                  {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  padding: 8,
                  marginLeft: 8,
                }}
                onPress={() => removeFile(index)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="close"
                  size={16}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          ))}
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
    </View>
  )
}

export default AttachFile