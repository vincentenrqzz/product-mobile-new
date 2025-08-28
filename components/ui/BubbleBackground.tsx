import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface Circle {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
}

interface BubbleBackgroundProps {
  isDark?: boolean
}

const BubbleBackground: React.FC<BubbleBackgroundProps> = ({
  isDark = false,
}) => {
  // Colors from finito-loader.svg
  const circleColors = ['#f9b65d', '#544c9c', '#ec4c74']

  // 4 strategically positioned bubbles
  const circles: Circle[] = [
    // Top right corner - BIG bubble, 50% visible (as requested)
    {
      id: 1,
      x: SCREEN_WIDTH - 80, // Half outside screen
      y: -80,
      size: 160,
      color: circleColors[1], // Purple
      opacity: 0.8,
    },
    // Bottom left corner - medium bubble, 50% visible
    {
      id: 2,
      x: -40,
      y: SCREEN_HEIGHT - 60,
      size: 80,
      color: circleColors[2], // Pink
      opacity: 0.7,
    },
    // Middle left edge - small bubble, 50% visible
    {
      id: 3,
      x: -25,
      y: SCREEN_HEIGHT * 0.4,
      size: 50,
      color: circleColors[0], // Orange
      opacity: 0.6,
    },
    // Bottom right corner - medium bubble, 50% visible
    {
      id: 4,
      x: SCREEN_WIDTH - 35,
      y: SCREEN_HEIGHT - 45,
      size: 70,
      color: circleColors[0], // Orange
      opacity: 0.7,
    },
  ]

  const renderCircle = (circle: Circle) => {
    return (
      <View
        key={circle.id}
        style={[
          styles.circle,
          {
            left: circle.x,
            top: circle.y,
            width: circle.size,
            height: circle.size,
          },
        ]}
      >
        <View
          style={[
            styles.circleGradient,
            {
              width: circle.size,
              height: circle.size,
              borderRadius: circle.size / 2,
              backgroundColor: circle.color,
              opacity: circle.opacity,
            },
          ]}
        />
      </View>
    )
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {circles.map(renderCircle)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: 'absolute',
  },
  circleGradient: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
})

export default BubbleBackground
