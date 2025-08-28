import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import SignatureCanvas from 'react-native-signature-canvas'

interface SignatureProps {
  label?: string
  onSignatureCapture: (filename: string) => void
  value?: string // filename
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
}

const Signature: React.FC<SignatureProps> = ({
  label,
  onSignatureCapture,
  value,
  error,
  helperText,
  containerStyle,
  required = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentSignature, setCurrentSignature] = useState<string | null>(null)

  // Handle signature canvas events
  const handleOK = (signature: string) => {
    // Store the signature image for display
    setCurrentSignature(signature)
    // Generate filename for the form value
    const filename = `signature_${Date.now()}.png`
    onSignatureCapture(filename)
    setIsModalVisible(false)
    Alert.alert('Success', 'Signature captured successfully!')
  }

  const handleClear = () => {
    setCurrentSignature(null)
    onSignatureCapture('')
  }

  const handleEmpty = () => {
    Alert.alert('Empty', 'Please draw your signature before saving.')
  }

  // Signature canvas style
  const style = `
    .m-signature-pad--footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #F8F9FA;
      border-top: 1px solid #E5E7EB;
      padding: 8px;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    .m-signature-pad--footer .button {
      background-color: #241c4c !important;
      color: #FFFFFF !important;
      border: none !important;
      border-radius: 6px !important;
      padding: 6px 12px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer;
      min-width: 60px;
    }
    .m-signature-pad--footer .button.clear {
      background-color: #EF4444 !important;
    }
    .m-signature-pad {
      position: relative;
      width: 100%;
      height: 180px;
      border: none;
      background-color: #FFFFFF;
      touch-action: none;
    }
    .signature-pad {
      width: 100%;
      height: 140px;
      border: 1px solid #E5E7EB;
      border-radius: 8px 8px 0 0;
    }
    body, html {
      width: 100%; 
      height: 180px;
      margin: 0;
      padding: 0;
      touch-action: none;
      overflow: hidden;
    }
  `

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

      {/* Signature Button - Similar to TakePictureButton */}
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
        onPress={() => {
          // console.log('Signature button pressed')
          setIsModalVisible(true)
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="draw"
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
          Signature
        </Text>
      </TouchableOpacity>

      {/* Signature Canvas Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            paddingTop: 50,
          }}
        >
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Create Your Signature
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={{
                padding: 8,
              }}
            >
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Signature Canvas */}
          <View style={{ flex: 1, padding: 20 }}>
            <SignatureCanvas
              onOK={handleOK}
              onEmpty={handleEmpty}
              onClear={handleClear}
              descriptionText=""
              clearText="Clear"
              confirmText="Save"
              webStyle={style}
              autoClear={false}
              imageType="image/png"
              backgroundColor="rgba(255,255,255,0)"
              penColor="#241c4c"
            />
          </View>
        </View>
      </Modal>

      {/* Current Signature Display */}
      {currentSignature && (
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
            padding: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Current Signature:
          </Text>
          <Image
            source={{ uri: currentSignature }}
            style={{
              width: '100%',
              height: 100,
              borderRadius: 6,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={handleClear}
            style={{
              marginTop: 8,
              alignSelf: 'flex-end',
              padding: 8,
              backgroundColor: '#EF4444',
              borderRadius: 6,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              Clear Signature
            </Text>
          </TouchableOpacity>
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

export default Signature
