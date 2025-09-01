import AppLogo from '@/components/ui/AppLogo'
import { useAppTheme } from '@/hooks/useAppTheme'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import moment from 'moment'
import 'moment/locale/en-gb'
import 'moment/locale/he'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'

interface TaskHeaderContentProps {
  timeNow: string
  matchLogo: any
  onRefreshTasks: () => void
  setTimeNow: React.Dispatch<React.SetStateAction<string | Date>>
}

/**
 * Modern TaskHeaderContent Component
 * Features: Enhanced typography, gradient backgrounds, smooth animations
 */
const TaskHeaderContent: React.FC<TaskHeaderContentProps> = ({
  timeNow,
  matchLogo,
  setTimeNow,
  onRefreshTasks,
}) => {
  const { colors, isDark } = useAppTheme()
  const buttonScale = useSharedValue(1)
  const pulseAnim = useSharedValue(1)

  // Animated button styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value > 1 ? 0.7 : 1,
  }))

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    buttonScale.value = withSpring(1)
    // Add pulse animation
    pulseAnim.value = withSequence(
      withSpring(1.2, { duration: 150 }),
      withSpring(1, { duration: 150 }),
    )
  }

  const currentTime = moment().format('dddd, MMM DD')
  const greeting =
    moment().hour() < 12
      ? 'Good Morning'
      : moment().hour() < 17
        ? 'Good Afternoon'
        : 'Good Evening'

  const formatted = moment(timeNow, 'DD/MM/YYYY HH:mm').format('HH:mm')

  return (
    <View style={styles.container}>
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        {/* Left Side - Logo and Info */}
        <Animated.View
          entering={FadeInRight.duration(600)}
          style={styles.leftSection}
        >
          <View style={styles.logoContainer}>
            <AppLogo />
          </View>

          <View style={styles.infoSection}>
            <Text
              style={[
                styles.greetingText,
                { color: isDark ? colors.text : '#4A5568' },
              ]}
            >
              {greeting}
            </Text>
            {timeNow && (
              <Text
                style={[
                  styles.timeText,
                  { color: isDark ? colors.text : '#2D3748' },
                ]}
              >
                {currentTime} • {timeNow ? formatted : ''}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Right Side - Action Button */}
        <Animated.View entering={FadeInRight.duration(600).delay(200)}>
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
              style={styles.addButtonContainer}
            >
              <LinearGradient
                colors={
                  isDark ? ['#667EEA', '#764BA2'] : ['#4F46E5', '#7C3AED']
                }
                style={styles.addButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={pulseStyle}>
                  <MaterialCommunityIcons name="plus" size={18} color="white" />
                </Animated.View>
              </LinearGradient>

              {/* Floating Action Button Shadow */}
              <View
                style={[
                  styles.buttonShadow,
                  {
                    shadowColor: isDark ? '#667EEA' : '#4F46E5',
                  },
                ]}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  )
}

// Modern Styles
const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 16,
  },
  infoSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.8,
  },
  addButtonContainer: {
    position: 'relative',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  buttonShadow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
})

export default TaskHeaderContent
