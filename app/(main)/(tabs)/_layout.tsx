import * as Haptics from 'expo-haptics'
import { Tabs } from 'expo-router'
import React from 'react'
import { Pressable, useWindowDimensions, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'

type IconName = keyof typeof Ionicons.glyphMap

interface AnimatedIndicatorProps {
  activeIndex: number
  tabCount: number
  isDark: boolean
  containerWidth?: number
}

interface TabItemProps {
  routeName: string
  isFocused: boolean
  onPress: () => void
  isDark: boolean
}

const SimpleAnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [containerWidth, setContainerWidth] = React.useState(0)

  return (
    <View
      className="px-auto absolute bottom-0 left-0 right-0 pb-20"
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout
        console.log('Container Width:', width)
        if (width > 0) {
          setContainerWidth(width)
        }
      }}
    >
      <View
        className={`
          mx-auto w-full max-w-sm overflow-hidden rounded-3xl px-2
          ${isDark ? 'bg-gray-900/80' : 'bg-white'}
        `}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <BlurView
          intensity={25}
          tint={isDark ? 'dark' : 'light'}
          className="absolute inset-0"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="relative h-16 flex-row">
          {/* <AnimatedIndicator
            activeIndex={state.index}
            tabCount={state.routes.length}
            isDark={isDark}
            containerWidth={containerWidth || 300}
          /> */}
          {state.routes.map((route, index) => {
            // const { options } = descriptors[route.key]
            const isFocused = state.index === index

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate(route.name)
              }
            }

            return (
              <TabItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                isDark={isDark}
              />
            )
          })}
        </View>
      </View>
    </View>
  )
}

const AnimatedIndicator: React.FC<AnimatedIndicatorProps> = ({
  activeIndex,
  tabCount,
  isDark,
}) => {
  const { width: screenWidth } = useWindowDimensions()
  const translateX = useSharedValue(0)
  const tabWidthPercentage = 100 / tabCount
  const containerWidth = screenWidth * 0.9
  const tabWidth = containerWidth / tabCount

  const paddingMap: any = {
    0: { left: 10, right: 10 },
    1: { left: 8, right: 20 },
    2: { left: 0, right: 25 },
  }

  const padding = paddingMap[activeIndex] ?? { left: 16, right: 16 }

  React.useEffect(() => {
    const newTranslateX = activeIndex * tabWidth
    translateX.value = withSpring(newTranslateX, {
      damping: 20,
      stiffness: 300,
    })
  }, [activeIndex, translateX, tabWidth])

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: `${tabWidthPercentage}%`,
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: padding.left,
      paddingRight: padding.right,
    }
  })

  return (
    <Animated.View
      style={[
        animatedStyles,
        {
          position: 'absolute',
          bottom: 0,
          height: '100%',
        },
      ]}
    >
      <View className="h-full rounded-2xl bg-blue-500/10" />
    </Animated.View>
  )
}

const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  isDark,
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(isFocused ? 1 : 0.6)
  const translateY = useSharedValue(0)

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
    })
    opacity.value = withTiming(isFocused ? 1 : 0.6, {
      duration: 200,
    })
    translateY.value = withSpring(isFocused ? -2 : 0, {
      damping: 15,
      stiffness: 300,
    })
  }, [isFocused])

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.9)
  }

  const handlePressOut = () => {
    scale.value = withSpring(isFocused ? 1.1 : 1)
  }

  const getIconName = (): IconName => {
    switch (routeName) {
      case 'settings':
        return isFocused ? 'settings' : 'settings-outline'
      case 'tasks':
        return 'menu'
      case 'home':
        return isFocused ? 'home' : 'home-outline'
      default:
        return 'help-circle-outline'
    }
  }

  const iconColor = isFocused
    ? isDark
      ? '#60A5FA'
      : '#3B82F6'
    : isDark
      ? '#6B7280'
      : '#9CA3AF'

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="relative z-10 flex-1 items-center justify-center"
    >
      <Animated.View style={animatedStyles} className="items-center">
        <Ionicons name={getIconName()} size={24} color={iconColor} />
      </Animated.View>
    </Pressable>
  )
}

// Main Tab Layout Component
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SimpleAnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
    </Tabs>
  )
}
