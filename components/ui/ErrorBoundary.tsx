import React, { Component, ReactNode } from 'react'
import { View, Text } from 'react-native'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary component for graceful error handling
 * 
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    console.error('Dashboard Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg font-semibold text-red-600 mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Please restart the app or contact support if the problem persists.
          </Text>
        </View>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary