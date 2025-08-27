/**
 * KPI Card configuration interface for dashboard metrics
 */
export interface KpiCardConfig {
  key: string
  title: string
  value: number
  icon: string
  bg: string
  lightBG: string
  index?: number
}

/**
 * Dashboard metrics type for task statistics
 */
export type DashboardMetrics = 'openToday' | 'doneToday' | 'inProgress' | 'openAndInProgress'

/**
 * User information interface for dashboard display
 */
export interface DashboardUser {
  name?: string
  family_name?: string
  avatar?: string
  email?: string
}

/**
 * Error boundary state interface
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Animation configuration for dashboard components
 */
export interface AnimationConfig {
  duration?: number
  delay?: number
  useNativeDriver?: boolean
}

/**
 * Theme configuration for dashboard styling
 */
export interface DashboardTheme {
  isDark: boolean
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
}

/**
 * Loading states for different dashboard sections
 */
export interface LoadingStates {
  userInfo: boolean
  taskStats: boolean
  userGroup: boolean
  refreshing: boolean
}