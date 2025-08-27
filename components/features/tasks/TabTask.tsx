import useUserInfoStore from '@/store/userInfo'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppTheme } from '@/hooks/useAppTheme'

interface TabTaskProps {
  statusesTabs: { [key: string]: any[] } // A map of statuses to tasks (the structure is not clear from the code)
  setActiveTab: (tab: string) => void // A function to update the active tab
  activeTab: string // The current active tab
}

/**
 * Modern TabTask Component
 * Features: Gradient backgrounds, smooth animations, enhanced visual feedback
 */
const TabTask: React.FC<TabTaskProps> = ({
  statusesTabs,
  setActiveTab,
  activeTab,
}) => {
  const { userSettings } = useUserInfoStore()
  const { colors, isDark } = useAppTheme()
  const [labels, setLabels] = useState<any>({})
  
  // Simplified without complex animations

  const showEscalateTab = useMemo(() => {
    const match = userSettings.find((item) => item.key === 'showEscalateTab')
    return match?.value?.toString() === 'true'
  }, [userSettings])

  // Get visible tabs
  const visibleTabs = useMemo(() => {
    return Object.keys(statusesTabs).filter((key) => {
      if (key === 'escalate' && !showEscalateTab) {
        return false
      }
      return true
    })
  }, [statusesTabs, showEscalateTab])

  useEffect(() => {
    const match = userSettings.find((item) => item.key === 'mobileTabLabels')

    if (match?.value) {
      const parseLabels = JSON.parse(match?.value?.toString())
      if (parseLabels) {
        setLabels(parseLabels)
      } else {
        setLabels({})
      }
    } else {
      setLabels({})
    }
  }, [userSettings])


  const TabButton = ({ tabKey, index }: { tabKey: string, index: number }) => {
    const label = labels[tabKey] || tabKey
    const isActive = activeTab === tabKey

    return (
      <TouchableOpacity
        onPress={() => setActiveTab(tabKey)}
        style={styles.tabButton}
        activeOpacity={0.8}
      >
        {/* Tab Background */}
        <View style={styles.tabContainer}>
          {isActive && (
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']
                  : ['rgba(79, 70, 229, 0.1)', 'rgba(124, 58, 237, 0.1)']
              }
              style={styles.activeTabBackground}
            />
          )}
          
          {/* Tab Content */}
          <Text style={[
            styles.tabText, 
            { 
              color: isActive 
                ? (isDark ? '#667EEA' : '#4F46E5')
                : (isDark ? '#9CA3AF' : '#6B7280')
            }
          ]}>
            {label}
          </Text>
          
          {/* Active Indicator */}
          {isActive && (
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor: isDark ? '#667EEA' : '#4F46E5',
                }
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Tab Buttons */}
        <View style={styles.tabRow}>
          {visibleTabs.map((key, index) => (
            <TabButton key={key} tabKey={key} index={index} />
          ))}
        </View>
      </ScrollView>
      
      {/* Bottom Border Line */}
      <View 
        style={[
          styles.bottomBorder,
          {
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)'
          }
        ]} 
      />
    </View>
  )
}

// Modern Styles
const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    marginHorizontal: 6,
  },
  tabContainer: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    width: 24,
    height: 3,
    borderRadius: 2,
    transform: [{ translateX: -12 }],
  },
  bottomBorder: {
    height: 1,
    marginTop: 8,
    marginHorizontal: 16,
  },
})

export default TabTask
