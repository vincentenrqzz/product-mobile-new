import type { PropsWithChildren, ReactElement } from 'react'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated'

import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor } from '@/hooks/useThemeColor'

import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const HEADER_HEIGHT = 150

type Props = PropsWithChildren<{
  headerContent?: ReactElement
  headerBackgroundColor?: { dark: string; light: string }
}>

export default function ParallaxScrollView({
  children,
  headerContent,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light'
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef)

  // ✅ Safe in and out of Tabs
  const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0
  const insets = useSafeAreaInsets()
  const bottom = tabBarHeight + insets.bottom

  const backgroundColor = useThemeColor({ light: '', dark: '' }, 'background')

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [2, 1, 1],
        ),
      },
    ],
  }))

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {headerContent && (
          <Animated.View
            className="px-2"
            style={[
              styles.header,
              {
                backgroundColor:
                  headerBackgroundColor?.[colorScheme] ?? backgroundColor,
              },
              headerAnimatedStyle,
            ]}
          >
            {headerContent}
          </Animated.View>
        )}

        {/* removed stray leading comma in array */}
        <View style={styles.content} className="p-4 ">
          {children}
        </View>
      </Animated.ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: HEADER_HEIGHT, overflow: 'hidden' },
  content: { flex: 1, overflow: 'hidden' },
})
