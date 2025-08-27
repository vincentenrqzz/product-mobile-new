import React, { useState } from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface SurveyProps {
  label?: string
  onRatingSelect: (rating: number) => void
  selectedRating?: number | null
  stepsNumber?: number
  preWord?: string
  postWord?: string
  error?: string
  helperText?: string
  containerStyle?: ViewStyle
  required?: boolean
}

const Survey: React.FC<SurveyProps> = ({
  label,
  onRatingSelect,
  selectedRating,
  stepsNumber = 5,
  preWord = 'Poor',
  postWord = 'Excellent',
  error,
  helperText,
  containerStyle,
  required = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentRating, setCurrentRating] = useState<number | null>(selectedRating || null)

  const handleRatingPress = (rating: number) => {
    setCurrentRating(rating)
    onRatingSelect(rating)
  }

  // Get color based on rating value
  const getRatingColor = (rating: number) => {
    const colors = [
      '#EF4444', // 1 - Red (Poor)
      '#F97316', // 2 - Orange  
      '#EAB308', // 3 - Yellow
      '#22C55E', // 4 - Light Green
      '#16A34A', // 5 - Green (Excellent)
    ]
    return colors[rating - 1] || '#241c4c'
  }

  const renderRatingScale = () => {
    const ratingItems = []
    
    for (let i = 1; i <= stepsNumber; i++) {
      const isSelected = currentRating === i
      const ratingColor = getRatingColor(i)
      
      ratingItems.push(
        <View key={i} style={{
          alignItems: 'center',
          flex: 1,
          marginHorizontal: 2,
        }}>
          {/* Number */}
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            {i}
          </Text>
          
          {/* Radio Button */}
          <TouchableOpacity
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: isSelected ? ratingColor : '#D1D5DB',
              backgroundColor: isSelected ? ratingColor : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleRatingPress(i)}
            activeOpacity={0.7}
          >
            {isSelected && (
              <MaterialIcons
                name="check"
                size={10}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        </View>
      )
    }

    return ratingItems
  }

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

      {/* Survey Button - Similar to TakePictureButton */}
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
          name="poll"
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
          Rate This
        </Text>
      </TouchableOpacity>

      {/* Expanded Rating Scale */}
      {isExpanded && (
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: error ? '#FCA5A5' : '#E5E7EB',
            backgroundColor: '#FFFFFF',
            padding: 16,
          }}
        >
          {/* Scale Description */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: '#6B7280',
                fontWeight: '500',
              }}
            >
              {preWord}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: '#6B7280',
                fontWeight: '500',
              }}
            >
              {postWord}
            </Text>
          </View>

          {/* Rating Scale */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {renderRatingScale()}
          </View>

          {/* Selected Rating Display */}
          {currentRating && (
            <View
              style={{
                marginTop: 16,
                padding: 8,
                backgroundColor: `${getRatingColor(currentRating)}15`,
                borderRadius: 6,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: getRatingColor(currentRating),
                  fontWeight: '600',
                }}
              >
                Selected Rating: {currentRating} / {stepsNumber}
              </Text>
            </View>
          )}
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

export default Survey