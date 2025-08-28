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

  // Static circles positioned at screen edges
  const circles: Circle[] = [
    // Top left corner - 50% visible
    {
      id: 1,
      x: -75, // Half outside screen
      y: -75,
      size: 150,
      color: circleColors[0], // Orange
      opacity: 1.0,
    },
    // Top right corner - 50% visible
    {
      id: 2,
      x: SCREEN_WIDTH - 75, // Half outside screen
      y: -60,
      size: 120,
      color: circleColors[1], // Purple
      opacity: 1.0,
    },
    // Bottom left edge - 50% visible
    {
      id: 3,
      x: -90,
      y: SCREEN_HEIGHT - 120,
      size: 180,
      color: circleColors[2], // Pink
      opacity: 1.0,
    },
    // Bottom right corner - 50% visible
    {
      id: 4,
      x: SCREEN_WIDTH - 65,
      y: SCREEN_HEIGHT - 65,
      size: 130,
      color: circleColors[0], // Orange
      opacity: 1.0,
    },
    // Middle right edge - 50% visible
    {
      id: 5,
      x: SCREEN_WIDTH - 50,
      y: SCREEN_HEIGHT * 0.3,
      size: 100,
      color: circleColors[1], // Purple
      opacity: 1.0,
    },
    // Middle left edge - 50% visible
    {
      id: 6,
      x: -70,
      y: SCREEN_HEIGHT * 0.6,
      size: 140,
      color: circleColors[2], // Pink
      opacity: 1.0,
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
