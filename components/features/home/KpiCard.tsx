import { FontAwesome5 } from '@expo/vector-icons'
import { 
  Text, 
  View, 
  Pressable, 
  Animated, 
  useColorScheme,
  Platform,
  Dimensions
} from 'react-native'
import { useEffect, useRef, memo } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface KpiCardProps {
  title: string
  value: number
  icon: string
  bgColor: string
  lightBG: string
  index?: number
}

/**
 * Modern KPI Card component with glassmorphism design, animations, and haptic feedback
 * 
 * Features:
 * - Gradient backgrounds with dark mode support
 * - Smooth entrance animations with staggered delay
 * - Press animations and haptic feedback
 * - Responsive design with proper touch targets
 * - Accessibility support with proper labels
 */
const KpiCard = memo(({
  title,
  value,
  icon,
  bgColor,
  lightBG,
  index = 0,
}: KpiCardProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Card will use parent container width (48%)

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 150
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start()

    // Subtle pulse animation for value changes
    if (value > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }, [index, value])

  const handlePress = async () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Parse gradient colors from bgColor prop
  const gradientColors = bgColor.includes('from-') ? 
    // Handle Tailwind gradient format
    bgColor.includes('blue') ? 
      (isDark ? ['#1D4ED8', '#1E3A8A'] : ['#3B82F6', '#1D4ED8']) :
    bgColor.includes('green') || bgColor.includes('emerald') ?
      (isDark ? ['#059669', '#047857'] : ['#10B981', '#059669']) :
    bgColor.includes('amber') || bgColor.includes('orange') ?
      (isDark ? ['#D97706', '#C2410C'] : ['#F59E0B', '#D97706']) :
    bgColor.includes('purple') || bgColor.includes('violet') ?
      (isDark ? ['#7C3AED', '#5B21B6'] : ['#8B5CF6', '#7C3AED']) :
      ['#6B7280', '#4B5563'] // fallback
    : ['#6B7280', '#4B5563'] // fallback for old format

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: Animated.multiply(scaleAnim, pulseAnim) }
        ],
        flex: 1,
      }}
    >
      <Pressable
        onPress={handlePress}
        className="active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value} tasks`}
        accessibilityHint="Double tap to view details"
      >
        <View className="relative overflow-hidden rounded-2xl">
          {/* Background gradient */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />
          
          {/* Glass overlay for glassmorphism effect */}
          <View 
            className="absolute inset-0"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
            }}
          />

          {/* Card content */}
          <View className="p-5 gap-4">
            {/* Header with icon and badge */}
            <View className="flex-row items-center justify-between">
              <View className={`w-12 h-12 rounded-xl items-center justify-center ${
                isDark ? 'bg-white/10' : 'bg-white/20'
              }`}>
                <FontAwesome5 
                  name={icon} 
                  size={20} 
                  color="#FFFFFF" 
                  solid={icon === 'check-circle'}
                />
              </View>
              
              <View className={`px-2 py-1 rounded-full ${lightBG}`}>
                <Text className={`text-xs font-medium ${
                  isDark ? 'text-white/80' : 'text-white'
                }`}>
                  Today
                </Text>
              </View>
            </View>

            {/* Value and title */}
            <View className="gap-1">
              <Text 
                className="text-3xl font-bold text-white"
                style={{ 
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {value.toLocaleString()}
              </Text>
              <Text className="text-base font-semibold text-white/90 leading-5">
                {title}
              </Text>
            </View>
          </View>

          {/* Subtle shine effect */}
          <View 
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: [{ scale: 0.5 }],
            }}
          />
        </View>
      </Pressable>
    </Animated.View>
  )
})

KpiCard.displayName = 'KpiCard'

export default KpiCard
