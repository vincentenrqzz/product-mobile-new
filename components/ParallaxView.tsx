import type { PropsWithChildren, ReactElement } from 'react'
import { StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor } from '@/hooks/useThemeColor'

const HEADER_HEIGHT = 150

type Props = PropsWithChildren<{
  headerContent?: ReactElement
  headerBackgroundColor?: { dark: string; light: string }
}>

export default function ParallaxView({
  children,
  headerContent,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light'
  const backgroundColor = useThemeColor({ light: '', dark: '' }, 'background')
  const insets = useSafeAreaInsets()

  return (
    <Animated.View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <Animated.View style={{ flex: 1 }}>
        {headerContent && (
          <Animated.View
            className="px-2"
            style={[
              styles.header,
              {
                backgroundColor:
                  headerBackgroundColor && headerBackgroundColor[colorScheme],
                paddingTop: insets.top,
              },
            ]}
          >
            {headerContent}
          </Animated.View>
        )}
        <Animated.View
          style={[styles.content, { backgroundColor: 'transparent' }]}
          className="pb-14"
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
})
