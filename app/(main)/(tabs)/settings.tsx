import ParallaxScrollView from '@/components/ParallaxScrollView'
import AppLogo from '@/components/ui/AppLogo'
import { startQueueLoop, stopQueueLoop } from '@/services/queues/startQueueLoop'
import useAuthStore from '@/store/auth'
import useTaskStore from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'

export default function Settings() {
  const router = useRouter()
  const { logout, envState } = useAuthStore()
  const { userInfo } = useUserInfoStore()
  const { setPendingImages, setPendingTasks } = useTaskStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark)
  const [selectedLanguage, setSelectedLanguage] = useState('ENG')

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Are you sure you want to clear the cache?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Success', 'Cache cleared successfully!')
        },
      },
    ])
  }

  const handleViewLogs = () => {
    Alert.alert('Logs', 'Application logs viewer will be implemented here.')
  }

  const handleLanguageToggle = () => {
    const newLanguage = selectedLanguage === 'ENG' ? 'HE' : 'ENG'
    setSelectedLanguage(newLanguage)
    Alert.alert('Language Changed', `Language changed to ${newLanguage}`)
  }

  const getIconColor = (iconName: string, isDestructive: boolean) => {
    if (isDestructive) return '#EF4444'

    // Define colors for specific icons
    const iconColors: { [key: string]: string } = {
      lock: '#F59E0B', // Amber for security
      palette: '#8B5CF6', // Purple for theme
      language: '#10B981', // Green for language
      'play-arrow': '#06B6D4', // Cyan for start action
      'stop-circle': '#F97316', // Orange for stop action
      'cleaning-services': '#3B82F6', // Blue for cleaning
      description: '#6B7280', // Gray for logs
      person: '#EC4899', // Pink for profile
    }

    return iconColors[iconName] || (isDark ? '#9CA3AF' : '#6B7280')
  }

  const SettingRow = ({
    icon,
    title,
    onPress,
    rightComponent,
    isLast = false,
    isDestructive = false,
  }: {
    icon: string
    title: string
    onPress?: () => void
    rightComponent?: React.ReactNode
    isLast?: boolean
    isDestructive?: boolean
  }) => (
    <>
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-3">
          <MaterialIcons
            name={icon as any}
            size={22}
            color={getIconColor(icon, isDestructive)}
          />
          <Text
            className={`text-base font-medium ${
              isDestructive
                ? 'text-red-500'
                : isDark
                  ? 'text-white'
                  : 'text-gray-900'
            }`}
          >
            {title}
          </Text>
        </View>
        {rightComponent || (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={isDark ? '#6B7280' : '#9CA3AF'}
          />
        )}
      </TouchableOpacity>
      {!isLast && (
        <View
          className={`mx-4 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
        />
      )}
    </>
  )

  return (
    <View style={{ flex: 1 }}>
      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['#1a1a2e', '#16213e', '#0f3460']
            : ['#ffffff', '#f8faff', '#e8f4f8']
        }
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <ParallaxScrollView
        headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
        headerContent={
          <View className="p-6 pb-8">
            <View className="mb-6 flex-row items-center justify-between">
              <AppLogo />
              <Text
                className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {envState} - v1.9.2
              </Text>
            </View>

            {/* Simple User Profile */}
            <View className="flex-row items-center gap-3">
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <MaterialIcons
                  name="person"
                  size={24}
                  color={getIconColor('person', false)}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {`${userInfo?.name} ${userInfo?.family_name}`}
                </Text>
                <Text
                  className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {userInfo?.email}
                </Text>
              </View>
            </View>
          </View>
        }
      >
        <View
          className={`flex-1 px-4 py-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
        >
          {/* Account & Security */}
          <Text
            className={`mx-2 mb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Account & Security
          </Text>
          <View
            className={`mb-6 overflow-hidden rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <SettingRow
              icon="lock"
              title="Change Password"
              onPress={() => router.push('/(main)/change-password')}
              isLast={true}
            />
          </View>

          {/* App Preferences */}
          <Text
            className={`mx-2 mb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            App Preferences
          </Text>
          <View
            className={`mb-6 overflow-hidden rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <SettingRow
              icon="palette"
              title="Dark Mode"
              rightComponent={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#667EEA' }}
                  thumbColor={darkModeEnabled ? '#4F46E5' : '#F3F4F6'}
                />
              }
            />
            <SettingRow
              icon="language"
              title="Language"
              onPress={handleLanguageToggle}
              rightComponent={
                <Text
                  className={`text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {selectedLanguage}
                </Text>
              }
              isLast={true}
            />
          </View>

          {/* App Features */}
          <Text
            className={`mx-2 mb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            App Features
          </Text>
          <View
            className={`mb-6 overflow-hidden rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <SettingRow
              icon="play-arrow"
              title="Start Task"
              onPress={async () => {
                startQueueLoop()
                // setPendingImages(pendingImages)
                // setPendingTasks(pendingTasks)
              }}
            />
            <SettingRow
              icon="stop-circle"
              title="Stop Task"
              onPress={async () => {
                stopQueueLoop()
              }}
              isLast={true}
            />
          </View>

          {/* Data & Storage */}
          <Text
            className={`mx-2 mb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Data & Storage
          </Text>
          <View
            className={`mb-6 overflow-hidden rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <SettingRow
              icon="cleaning-services"
              title="Clear Cache"
              onPress={handleClearCache}
            />
            <SettingRow
              icon="description"
              title="Logs"
              onPress={handleViewLogs}
              isLast={true}
            />
          </View>

          {/* Exit Options */}
          <Text
            className={`mx-2 mb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Exit Options
          </Text>
          <View
            className={`mb-6 overflow-hidden rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <SettingRow
              icon="logout"
              title="Logout"
              onPress={() => {
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: logout },
                ])
              }}
              isLast={true}
              isDestructive={true}
            />
          </View>
        </View>
      </ParallaxScrollView>
    </View>
  )
}
