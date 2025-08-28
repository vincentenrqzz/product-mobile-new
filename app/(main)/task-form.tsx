import DynamicFormField from '@/components/features/forms/DynamicFormField'
import BackButton from '@/components/ui/BackButton'
import useTaskStore, { Task } from '@/store/tasks'
import { FormFieldTypes } from '@/types/form'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Formik } from 'formik'
import React, { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Yup from 'yup'

type IconName = keyof typeof Ionicons.glyphMap

interface TabItemProps {
  routeName: string
  isFocused: boolean
  onPress: () => void
  isDark: boolean
}

const CustomTabBar: React.FC = () => {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState('task-form')

  const tabs = [
    { name: 'settings', route: '/(main)/(tabs)/settings' },
    { name: 'tasks', route: '/(main)/(tabs)/tasks' },
    { name: 'home', route: '/(main)/(tabs)/home' },
  ]

  const handleTabPress = (tabName: string, route: string) => {
    setActiveTab(tabName)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(route as any)
  }

  return (
    <View
      style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.tabBar}>
        <BlurView
          intensity={25}
          tint={isDark ? 'dark' : 'light'}
          style={styles.tabBarBlur}
        />
        <View
          style={[
            styles.tabBarContent,
            isDark
              ? { backgroundColor: 'rgb(17, 24, 39)' }
              : { backgroundColor: 'rgb(255, 255, 255)' },
          ]}
        >
          {tabs.map((tab) => (
            <TabItem
              key={tab.name}
              routeName={tab.name}
              isFocused={activeTab === tab.name}
              onPress={() => handleTabPress(tab.name, tab.route)}
              isDark={isDark}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  isDark,
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  const translateY = useSharedValue(0)

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
    })
    opacity.value = withTiming(1, {
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
      ? '#667EEA'
      : '#4F46E5'
    : isDark
      ? '#6B7280'
      : '#9CA3AF'

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
    >
      <Animated.View style={animatedStyles}>
        <Ionicons name={getIconName()} size={24} color={iconColor} />
      </Animated.View>
    </Pressable>
  )
}

const TaskForm = () => {
  // builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task, fromListItemTab, statusLabels } = params
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // store
  const { updateTaskFormValues } = useTaskStore()

  // parse task param - memoize to prevent infinite re-renders
  const parsedTask: Task = React.useMemo(
    () => (typeof task === 'string' ? JSON.parse(task) : task),
    [task],
  )

  const insets = useSafeAreaInsets()

  // Generate initial values for Formik
  const getInitialValues = () => {
    if (!parsedTask?.form) return {}

    const initialValues: Record<string, any> = {}
    parsedTask.form
      .filter((field) => field.inputType !== 'geo')
      .forEach((field) => {
        // Handle date/datetime fields specially to ensure proper type conversion
        if (
          field.inputType === FormFieldTypes.DATE_TIME_REGISTER ||
          field.inputType === FormFieldTypes.DATE_TIME_PICKER ||
          field.inputType === FormFieldTypes.DATE_PICKER
        ) {
          const dateValue = field.value || field.defaultValue
          if (dateValue) {
            initialValues[field.key] =
              typeof dateValue === 'string' ? new Date(dateValue) : dateValue
          } else {
            initialValues[field.key] = null
          }
        } else if (field.inputType === FormFieldTypes.CHECKBOXES) {
          initialValues[field.key] = field.value || field.defaultValue || []
        } else {
          initialValues[field.key] = field.value || field.defaultValue || ''
        }
      })
    return initialValues
  }

  // Generate validation schema for Formik
  const getValidationSchema = () => {
    if (!parsedTask?.form) return Yup.object({})

    const schemaFields: Record<string, any> = {}

    parsedTask.form
      .filter((field) => field.inputType !== 'geo')
      .forEach((field) => {
        let fieldSchema: any

        // Base validation based on field type
        switch (field.inputType) {
          case FormFieldTypes.TEXT:
          case FormFieldTypes.TEXTAREA:
            fieldSchema = Yup.string()
            break
          case FormFieldTypes.DATE_PICKER:
          case FormFieldTypes.DATE_TIME_PICKER:
          case FormFieldTypes.DATE_TIME_REGISTER:
            fieldSchema = Yup.date().nullable()
            break
          case FormFieldTypes.CHECKBOXES:
            fieldSchema = Yup.array()
            break
          case FormFieldTypes.RADIO:
          case FormFieldTypes.DROPDOWN:
          case FormFieldTypes.AUTOCOMPLETE:
            fieldSchema = Yup.string()
            break
          default:
            fieldSchema = Yup.mixed()
        }

        // Add required validation if specified in rules
        if (field.rules?.required === true) {
          if (field.inputType === FormFieldTypes.CHECKBOXES) {
            fieldSchema = fieldSchema.min(1, `${field.label} is required`)
          } else if (
            field.inputType === FormFieldTypes.DATE_PICKER ||
            field.inputType === FormFieldTypes.DATE_TIME_PICKER ||
            field.inputType === FormFieldTypes.DATE_TIME_REGISTER
          ) {
            fieldSchema = fieldSchema.required(`${field.label} is required`)
          } else {
            fieldSchema = fieldSchema.required(`${field.label} is required`)
          }
        }

        schemaFields[field.key] = fieldSchema
      })

    return Yup.object(schemaFields)
  }

  const handleFormSubmit = (values: Record<string, any>) => {
    console.log('🚀 Form submitted with values:', values)
    console.log('📋 Task ID:', parsedTask.taskId)

    // Update task form values in the store
    updateTaskFormValues(parsedTask.taskId, values)
    console.log('✅ Task form values updated in store')

    // Process field actions based on form values and field rules
    if (parsedTask?.form) {
      parsedTask.form.forEach((field) => {
        const fieldValue = values[field.key]
        const actions = field.rules?.actions || []

        // Execute actions for fields that have values
        if (fieldValue && actions.length > 0) {
          actions.forEach((action) => {
            handleFieldAction(action, field, fieldValue, values)
          })
        }
      })
    }
  }

  const handleFieldAction = (
    action: string,
    field: any,
    fieldValue: any,
    allValues: Record<string, any>,
  ) => {
    console.log(`Executing action: ${action} for field: ${field.key}`)

    switch (action) {
      case 'startTask':
        // Handle task start logic
        // console.log('Starting task...')
        break

      case 'transmitDone':
        // Handle form completion/submission
        // console.log('Transmitting form completion...')
        // You can add your final submission logic here
        break

      default:
        console.log(`Unknown action: ${action}`)
    }
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <BackButton title={`${parsedTask.taskType} ${parsedTask.taskId}`} />
      </View>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={getValidationSchema()}
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => (
          <>
            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Task Info Card */}
              <View style={[styles.card, isDark && styles.cardDark]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <MaterialIcons
                      name="assignment"
                      size={24}
                      color={isDark ? '#60A5FA' : '#3B82F6'}
                    />
                    <Text style={[styles.cardTitle, isDark && styles.textDark]}>
                      Task Details
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      // Reset all form values to initial state
                      const resetValues: Record<string, any> = {}
                      parsedTask.form
                        ?.filter((field) => field.inputType !== 'geo')
                        .forEach((field) => {
                          if (field.inputType === 'checkboxes') {
                            resetValues[field.key] = []
                          } else {
                            resetValues[field.key] = ''
                          }
                        })

                      // Reset all fields using Formik's resetForm
                      Object.keys(resetValues).forEach((key) => {
                        setFieldValue(key, resetValues[key])
                      })

                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    }}
                    style={[
                      styles.resetButton,
                      isDark && styles.resetButtonDark,
                    ]}
                  >
                    <MaterialIcons
                      name="refresh"
                      size={20}
                      color={isDark ? '#60A5FA' : '#3B82F6'}
                    />
                    {/* <Text style={[styles.resetButtonText, isDark && styles.resetButtonTextDark]}>
                      Reset
                    </Text> */}
                  </Pressable>
                </View>
                <Text
                  style={[styles.taskId, isDark && styles.textSecondaryDark]}
                >
                  Task ID: {parsedTask.taskId}
                </Text>
                <Text
                  style={[styles.taskType, isDark && styles.textSecondaryDark]}
                >
                  Type: {parsedTask.taskType}
                </Text>
              </View>

              {/* Dynamic Form Fields */}
              {parsedTask?.form && parsedTask.form.length > 0 && (
                <View style={[styles.card, isDark && styles.cardDark]}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons
                      name="dynamic-feed"
                      size={24}
                      color={isDark ? '#34D399' : '#10B981'}
                    />
                    <Text style={[styles.cardTitle, isDark && styles.textDark]}>
                      Form Fields
                    </Text>
                  </View>

                  {parsedTask.form
                    .filter((field) => field.inputType !== 'geo')
                    .map((field, index) => (
                      <View
                        key={field.uniqueId || field.key || index}
                        style={styles.formFieldContainer}
                      >
                        <DynamicFormField
                          field={field}
                          value={values[field.key]}
                          onChange={(key: string, value: any) =>
                            setFieldValue(key, value)
                          }
                          error={
                            touched[field.key] && errors[field.key]
                              ? String(errors[field.key])
                              : undefined
                          }
                          task={parsedTask}
                          formValues={values}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                          }}
                        />
                      </View>
                    ))}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </Formik>

      {/* Bottom Tab Navigation */}
      <CustomTabBar />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120, // Space for bottom navigation
  },
  formFieldContainer: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#374151',
  },
  resetButtonTextDark: {
    color: '#D1D5DB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  textDark: {
    color: '#F9FAFB',
  },
  textSecondaryDark: {
    color: '#D1D5DB',
  },
  taskId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  taskType: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Bottom navigation styles
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default TaskForm
