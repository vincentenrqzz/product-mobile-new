import { useAppTheme } from '@/hooks/useAppTheme'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import moment from 'moment'
import React, { PropsWithChildren, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import Animated, {
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import DatePickerModal from './DatePickerModal'

type Props = PropsWithChildren<{
  searchbarBackgroundColor?: { dark: string; light: string }
  value: string // The search text
  onChangeText: React.Dispatch<React.SetStateAction<string>>
  setTimeNow: React.Dispatch<React.SetStateAction<string | Date>>
  onRefreshTasks: (isManual?: boolean) => Promise<void>
  timeNow: any
}>

/**
 * Modern Searchbar Component
 * Features: Glassmorphism effects, smooth animations, enhanced styling
 */
const Searchbar = ({
  searchbarBackgroundColor,
  value,
  onChangeText,
  setTimeNow,
  onRefreshTasks,
  timeNow,
}: Props) => {
  const { colors, isDark } = useAppTheme()
  const colorScheme = useColorScheme() ?? 'light'
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Animation values
  const searchScale = useSharedValue(1)
  const calendarScale = useSharedValue(1)
  const refreshRotation = useSharedValue(0)
  const focusScale = useSharedValue(1)

  // Animated styles
  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }, { scale: focusScale.value }],
  }))

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: calendarScale.value }],
  }))

  const refreshAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: searchScale.value },
      { rotate: `${refreshRotation.value}deg` },
    ],
  }))

  const handleSearchFocus = () => {
    setIsFocused(true)
    focusScale.value = withSpring(1.02)
  }

  const handleSearchBlur = () => {
    setIsFocused(false)
    focusScale.value = withSpring(1)
  }

  const handleCalendarPress = () => {
    calendarScale.value = withSequence(withSpring(0.9), withSpring(1))
    setIsDatePickerVisible(true)
  }

  const handleRefreshPress = () => {
    searchScale.value = withSequence(withSpring(0.9), withSpring(1))
    refreshRotation.value = withSpring(refreshRotation.value + 360)
    onRefreshTasks()
  }

  const formatSelectedDate = (date: any) => {
    if (!date) return ''
    return moment(date).format('MMM DD, YYYY')
  }

  return (
    <View style={styles.container}>
      {/* Main Search Row */}
      <Animated.View entering={FadeInUp.duration(600)}>
        <Animated.View style={[styles.searchRow, searchAnimatedStyle]}>
          {/* Enhanced Search Input */}
          <View style={styles.searchInputContainer}>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(55, 65, 81, 0.9)', 'rgba(75, 85, 99, 0.9)']
                  : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 255, 0.8)']
              }
              style={[
                styles.searchInputBackground,
                {
                  borderColor: isFocused
                    ? isDark
                      ? '#667EEA'
                      : '#4F46E5'
                    : 'rgba(255, 255, 255, 0.2)',
                  borderWidth: isFocused ? 2 : 1,
                },
              ]}
            >
              {/* Search Icon */}
              <View style={styles.searchIconContainer}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={isDark ? '#A0AEC0' : '#718096'}
                />
              </View>

              {/* Text Input */}
              <TextInput
                value={value}
                onChangeText={onChangeText}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="Search tasks..."
                placeholderTextColor={isDark ? '#A0AEC0' : '#A0ADB8'}
                style={[
                  styles.textInput,
                  {
                    color: isDark ? '#F3F4F6' : '#111827',
                  },
                ]}
              />
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Animated.View style={calendarAnimatedStyle}>
              <TouchableOpacity
                onPress={handleCalendarPress}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.8)',
                  },
                ]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']
                      : ['rgba(79, 70, 229, 0.1)', 'rgba(124, 58, 237, 0.1)']
                  }
                  style={styles.actionButtonGradient}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={isDark ? '#667EEA' : '#4F46E5'}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={refreshAnimatedStyle}>
              <TouchableOpacity
                onPress={handleRefreshPress}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.8)',
                  },
                ]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']
                      : ['rgba(79, 70, 229, 0.1)', 'rgba(124, 58, 237, 0.1)']
                  }
                  style={styles.actionButtonGradient}
                >
                  <Ionicons
                    name="reload"
                    size={18}
                    color={isDark ? '#667EEA' : '#4F46E5'}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Selected Date Filter */}
      {timeNow && (
        <Animated.View entering={FadeInRight.duration(400)}>
          <View style={styles.dateFilterContainer}>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']
                  : ['rgba(79, 70, 229, 0.1)', 'rgba(124, 58, 237, 0.1)']
              }
              style={styles.dateFilter}
            >
              <Text
                style={[
                  styles.dateFilterText,
                  { color: isDark ? '#667EEA' : '#4F46E5' },
                ]}
              >
                {formatSelectedDate(timeNow)}
              </Text>
              <TouchableOpacity
                onPress={() => setTimeNow('')}
                style={styles.dateFilterClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={isDark ? '#667EEA' : '#4F46E5'}
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>
      )}

      <DatePickerModal
        setTimeNow={setTimeNow}
        isDatePickerVisible={isDatePickerVisible}
        setIsDatePickerVisible={setIsDatePickerVisible}
      />
    </View>
  )
}

// Modern Styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInputBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateFilterContainer: {
    marginTop: 12,
    marginLeft: 4,
  },
  dateFilter: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  dateFilterClose: {
    marginLeft: 8,
    padding: 2,
  },
})

export default Searchbar
