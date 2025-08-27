import countTasksForDay from '@/lib/countTaskForDay'
import toIsraelTime from '@/lib/toIsraelTime'
import useTaskStore, { Task } from '@/store/tasks'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { FlatList, Text, View, StyleSheet, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { 
  FadeIn, 
  FadeInDown, 
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence
} from 'react-native-reanimated'
import { useAppTheme } from '@/hooks/useAppTheme'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  dateSeparator: boolean
  forEscalate: string
  onRefetchTask: () => void
  isRefresh: boolean
}

/**
 * Modern TaskList Component
 * Features: Enhanced empty states, beautiful date separators, smooth animations
 */
const TaskList = ({
  tasks,
  dateSeparator,
  forEscalate,
  onRefetchTask,
  isRefresh,
}: Props) => {
  //store
  const { taskStatuses } = useTaskStore()
  const { colors, isDark } = useAppTheme()
  
  // Animation values
  const emptyStateScale = useSharedValue(1)

  //memo
  const statusColors = useMemo(() => {
    return taskStatuses.reduce(
      (res: any, item: { Key: any; colorMobile: any }) => {
        return { ...res, [item.Key]: item.colorMobile }
      },
      {},
    )
  }, [taskStatuses])

  // Animate empty state icon
  React.useEffect(() => {
    if (tasks.length === 0) {
      emptyStateScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { duration: 1000 }),
          withSpring(1, { duration: 1000 })
        ),
        -1,
        true
      )
    }
  }, [tasks.length])

  const emptyStateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emptyStateScale.value }]
  }))

  //component
  const renderItem = ({ item, index }: { item: Task; index: number }) => {
    const israelTime = toIsraelTime(item.executionEndDate)
    const getCurrItemDate = israelTime.format('DD.M.YY')
    const getPrevItemDate =
      index > 0
        ? toIsraelTime(tasks[index - 1].executionEndDate).format('DD.M.YY')
        : null

    const getCurrentDay = israelTime.format('dddd')
    const taskCount = countTasksForDay(item.executionEndDate, tasks)

    const sameDate = getPrevItemDate === getCurrItemDate
    const backgroundColor =
      forEscalate === 'pending' ? 'white' : statusColors[item.statusId]

    return (
      <>
        {dateSeparator && !sameDate && (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            style={styles.dateSeparatorContainer}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)']
                  : ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.1)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dateSeparatorLine}
            />
            
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']
                  : ['rgba(79, 70, 229, 0.1)', 'rgba(124, 58, 237, 0.1)']
              }
              style={styles.dateSeparatorTextBackground}
            >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={isDark ? '#667EEA' : '#4F46E5'} 
                  style={{ marginRight: 6 }}
                />
              <Text style={[
                styles.dateSeparatorText,
                { color: isDark ? '#667EEA' : '#4F46E5' }
              ]}>
                {getCurrentDay} {getCurrItemDate} ({taskCount})
              </Text>
            </LinearGradient>
            
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)']
                  : ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.1)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dateSeparatorLine}
            />
          </Animated.View>
        )}

        <TaskItem
          task={item}
          forEscalate={forEscalate}
          backgroundColor={backgroundColor}
        />
      </>
    )
  }

  const renderEmptyComponent = () => {
    return (
      <Animated.View 
        entering={FadeIn.duration(800)}
        style={styles.emptyStateContainer}
      >
        {/* Background Illustration */}
        <View style={styles.emptyStateBackground}>
          <LinearGradient
            colors={
              isDark
                ? ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']
                : ['rgba(79, 70, 229, 0.05)', 'rgba(124, 58, 237, 0.1)']
            }
            style={styles.emptyStateBackgroundGradient}
          />
        </View>

        {/* Main Icon */}
        <Animated.View style={emptyStateAnimatedStyle}>
          <View style={[
            styles.emptyStateIconContainer,
            {
              backgroundColor: isDark 
                ? 'rgba(102, 126, 234, 0.1)' 
                : 'rgba(79, 70, 229, 0.1)',
            }
          ]}>
            <MaterialCommunityIcons
              name="clipboard-check-multiple-outline"
              size={64}
              color={isDark ? '#667EEA' : '#4F46E5'}
            />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.emptyStateContent}
        >
          <Text style={[
            styles.emptyStateTitle,
            { color: isDark ? colors.text : '#2D3748' }
          ]}>
            All caught up!
          </Text>
          <Text style={[
            styles.emptyStateDescription,
            { color: isDark ? '#A0AEC0' : '#718096' }
          ]}>
            No tasks to show right now. Take a moment to relax or add a new task to get started.
          </Text>
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.emptyStateDecorations}>
          {[...Array(3)].map((_, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.duration(600).delay(800 + index * 200)}
              style={[
                styles.decorativeCircle,
                {
                  backgroundColor: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  left: `${20 + index * 30}%`,
                  animationDelay: `${index * 0.5}s`,
                }
              ]}
            />
          ))}
        </View>
      </Animated.View>
    )
  }
  
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={tasks}
      keyExtractor={(item) => item.taskId.toString()}
      contentContainerStyle={[
        styles.listContainer,
        { flexGrow: 1 }
      ]}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      removeClippedSubviews={true}
      ListEmptyComponent={renderEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={isRefresh}
          onRefresh={onRefetchTask}
          colors={isDark ? ['#667EEA'] : ['#4F46E5']}
          tintColor={isDark ? '#667EEA' : '#4F46E5'}
          progressBackgroundColor={isDark ? '#1a1a2e' : '#ffffff'}
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
    />
  )
}

// Modern Styles
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 4,
    paddingTop: 0,
    paddingBottom: 100,
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
  },
  dateSeparatorTextBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    position: 'relative',
  },
  emptyStateBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateBackgroundGradient: {
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  emptyStateContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyStateDecorations: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: 20,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

export default TaskList
