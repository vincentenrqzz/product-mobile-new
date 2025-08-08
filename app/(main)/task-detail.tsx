import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/constants'
import parseValueForRender from '@/lib/parseValueForRenderer'
import useUserInfoStore from '@/store/userInfo'
import { Task, TaskStatusLabel } from '@/types/task'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// wala nako gia pillt tong visibleTaskId to be asked pa asaas gamit
const TaskDetail = () => {
  //builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const {
    task,
    fromListItemTab,
    statusLabels,
    forEscalate,
    getTaskCanBeExecuted,
  } = params

  //parsing params data
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)
  const parsedStatusLabels: TaskStatusLabel =
    typeof statusLabels === 'string' && JSON.parse(statusLabels)
  //store
  const { userSettings, userGroup } = useUserInfoStore()
  //state
  const [isLoading, setIsLoading] = useState(false)
  const [followUpTask, setFollowUpTask] = useState<any>([])
  const [followUpTaskWidth, setFollowUpTaskWidth] = useState(0)

  //memo
  const showSupportedStatusesForStartTask = useMemo(() => {
    const res = userSettings.find(
      (item) => item.key === 'executableTaskStatuses',
    )
    return res?.value ? JSON.parse(res?.value) : ['assigned', 'inProgress']
  }, [userSettings])

  const newButtons = useMemo(() => {
    const getSettingsButtons = userSettings.find(
      (item) => item.key === 'extraDetailsButton',
    )?.value

    return getSettingsButtons ? JSON.parse(getSettingsButtons) : []
  }, [userSettings])

  const getStatusRepInDoneTask = useMemo(() => {
    if (userSettings.length === 0) {
      return
    }
    const res = userSettings.find(
      (item) => item.key === 'statusesRepresentingDoneTask',
    )
    return JSON.parse(res?.value)
  }, [userSettings])

  const showSuppFollowTaskCreation = useMemo(() => {
    const getSettings = userSettings.find(
      (item) => item.key === 'supportFollowUpTaskCreation',
    )
    return getSettings?.value?.toString() === 'true'
  }, [userSettings])

  const creationFormType = useMemo(() => {
    if (userSettings.length === 0) {
      return
    }
    const res = userSettings.find((item) => item.key === 'createFormType')
    const parseRes = JSON.parse(res?.value)
    return parseRes[0]
  }, [userSettings])

  const newTaskDetails = useMemo(() => {
    const data = parsedTask.taskDetails.filter((item: any) => {
      return (
        item.orderMobile != null &&
        item.key !== 'urgentTask' &&
        item.value &&
        item.label
      )
    })
    data.sort((a: any, b: any) => a.orderMobile - b.orderMobile)
    return data
  }, [parsedTask.taskDetails])

  const taskGroupLabel =
    userGroup.find((group) => group.GroupName === parsedTask.groupName)
      ?.Description ?? parsedTask.groupName

  //functions
  const escalateTask = async (item: any) => {
    try {
      const { newStatus } = item

      setIsLoading(true)
      // setTaskSubmitting(false);

      // const updatedTask = {...task, statusId: newStatus};

      // const actionResult: any = await doAction({
      //   type: 'escalateTask',
      //   wholeTask: updatedTask,
      //   taskTypes,
      // });

      // if (!actionResult || Object.keys(actionResult).length === 0) {
      //   await storePendingTask(task, newStatus, 'pending');
      // } else {
      //   await refreshTaskLists();
      // }

      // closeForm({refresh: 'soft'});
    } catch (error) {
      console.error('Error escalating task:', error)
    } finally {
      setIsLoading(false)
      // setTaskSubmitting(true);
    }
  }

  const handleEscalation = async (item: any) => {
    setIsLoading(true)
    try {
      await escalateTask(item)
    } catch (error) {
      console.error('Error escalating task:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const onClickViewButton = async (imageUrl: string) => {
    // if (!imageUrl) {
    //   return
    // }
    // const IdToken = await AsyncStorage.getItem('IdToken')
    // const url = await getPhotoFromAmazon(IdToken, imageUrl)
    // const getUrlExtension = (url: string) => {
    //   return url.split(/[#?]/)[0]!.split('.').pop().trim()
    // }
    // const extension = getUrlExtension(url)
    // const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`
    // const options = {
    //   fromUrl: url,
    //   toFile: localFile,
    // } as any
    // RNFS.downloadFile(options)
    //   .promise.then(() => FileViewer.open(localFile))
    //   .then(() => {})
    //   .catch((error) => {})
  }

  //components
  const renderEscalatedTask = () => {
    switch (forEscalate) {
      case 'escalate':
        return (
          <View
            className="flex-1 items-center justify-center gap-4 bg-white" // Centers content
          >
            {showSupportedStatusesForStartTask.map((item: any) => {
              return item.includes(parsedTask?.statusId) ? (
                <TouchableOpacity
                  className="flex flex-row items-center justify-center rounded-full  p-4 px-20"
                  style={[
                    {
                      backgroundColor:
                        parsedTask?.statusId === 'pending'
                          ? 'lightgray'
                          : '#00A7D3',
                    },
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/task-form',
                      params: {
                        task,
                      },
                    })
                  }}
                  disabled={parsedTask?.statusId === 'pending' ? true : false}
                >
                  <Text
                    style={[
                      ,
                      {
                        color:
                          parsedTask?.statusId === 'pending'
                            ? 'black'
                            : 'white',
                      },
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="large" color="skyblue" />
                    ) : (
                      (item.label ?? 'start')
                    )}
                  </Text>
                </TouchableOpacity>
              ) : null
            })}
            {newButtons.map((item: any) => {
              const parseItem =
                typeof item === 'string' ? JSON.parse(item) : item
              return parseItem.statuses.includes(parsedTask?.statusId) ? (
                <TouchableOpacity
                  className="flex flex-row items-center justify-center rounded-full p-4 px-20"
                  disabled={isLoading}
                  onPress={async () => {
                    if (parseItem?.modal) {
                      const modalButtons =
                        typeof parseItem?.modal === 'string'
                          ? JSON.parse(parseItem?.modal)
                          : parseItem?.modal

                      Alert.alert(
                        '',
                        modalButtons?.modalText,
                        modalButtons?.modalButtons.map((items: any) => ({
                          text: items?.label,
                          style: 'default',
                          onPress: () => {
                            if (
                              items?.action.toString().toLowerCase() ===
                              'approve'
                            ) {
                              handleEscalation(parseItem)
                            }
                          },
                        })),
                        {
                          cancelable: true,
                        },
                      )
                    } else {
                      await handleEscalation(parseItem)
                    }
                  }}
                >
                  <Text className="text-white">
                    {isLoading ? (
                      <ActivityIndicator size="large" color="skyblue" />
                    ) : (
                      (parseItem.label ?? 'submit')
                    )}
                  </Text>
                </TouchableOpacity>
              ) : null
            })}
          </View>
        )
      case 'notDone':
        return (
          <View
            className="flex-1 items-center justify-center bg-white" // Centers content
          >
            {getTaskCanBeExecuted && (
              <TouchableOpacity
                className="flex flex-row items-center justify-center rounded-full p-4 px-20"
                style={[
                  {
                    backgroundColor:
                      parsedTask?.statusId === 'pending'
                        ? 'lightgray'
                        : '#00A7D3',
                  },
                ]}
                onPress={() => {
                  // navigation.navigate('FormsPage', {
                  //   itemData: task,
                  // })
                  router.push({
                    pathname: '/(main)/task-form',
                    params: {
                      task,
                    },
                  })
                  // handleOneTaskExecution(task.taskId)
                }}
                disabled={parsedTask?.statusId === 'pending'}
              >
                <Text
                  style={[
                    {
                      color:
                        parsedTask?.statusId === 'pending' ? 'black' : 'white',
                    },
                  ]}
                >
                  {'start'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      case 'done':
        return (
          <View
            className="flex-1 items-center justify-between gap-4 bg-white" // Centers content
          >
            {getStatusRepInDoneTask?.includes(parsedTask?.statusId) ? (
              <TouchableOpacity
                className=" rounded-full bg-[#00A7D3] p-4 px-20"
                onPress={() => {
                  // navigation.navigate('InfoPage', {
                  //   itemData: task,
                  // })
                  router.push({
                    pathname: '/(main)/task-info',
                    params: {
                      task,
                    },
                  })
                }}
              >
                <Text className="text-white">{'formView'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex flex-row items-center justify-center rounded-full bg-[#00A7D3] p-4 px-20"
                style={[
                  {
                    backgroundColor:
                      parsedTask?.statusId === 'pending'
                        ? 'lightgray'
                        : '#00A7D3',
                  },
                ]}
                onPress={() => {
                  // navigation.navigate('FormsPage', {
                  //   itemData: task,
                  // })
                  router.push({
                    pathname: '/(main)/task-form',
                    params: {
                      task,
                    },
                  })
                }}
                disabled={parsedTask?.statusId === 'pending' ? true : false}
              >
                <Text
                  style={[
                    ,
                    {
                      color:
                        parsedTask?.statusId === 'pending' ? 'black' : 'white',
                    },
                  ]}
                >
                  {'start'}
                </Text>
              </TouchableOpacity>
            )}
            {showSuppFollowTaskCreation ? (
              getStatusRepInDoneTask.includes(parsedTask?.statusId) ? (
                <TouchableOpacity
                  className="rounded-full bg-[#00A7D3] p-4 px-20"
                  onPress={() => {
                    // navigation.navigate('FormsPage', {
                    //   itemData: followUpTask,
                    //   followUpTask: true,
                    //   creationType: getCreateFormType,
                    // })

                    router.push({
                      pathname: '/(main)/task-form',
                      params: {
                        task: JSON.stringify(followUpTask),
                        followUpTask: 1, // 1 true 0 false
                        creationFormType,
                      },
                    })
                  }}
                >
                  <Text
                    className="text-white"
                    onTextLayout={(e) =>
                      setFollowUpTaskWidth(e.nativeEvent.lines[0].width)
                    }
                  >
                    Follow Up Task
                  </Text>
                </TouchableOpacity>
              ) : null
            ) : null}
          </View>
        )
      default:
        return (
          <View
            className="flex-1 items-center justify-center gap-4 bg-white" // Centers content
          >
            {showSupportedStatusesForStartTask.map((item: any) => {
              return item.includes(parsedTask?.statusId) ? (
                <TouchableOpacity
                  className="flex flex-row items-center justify-center rounded-full p-4 px-20"
                  style={[
                    {
                      backgroundColor:
                        parsedTask?.statusId === 'pending'
                          ? 'lightgray'
                          : '#00A7D3',
                    },
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/task-form',
                      params: {
                        task,
                      },
                    })
                  }}
                  disabled={parsedTask?.statusId === 'pending' ? true : false}
                >
                  <Text
                    style={[
                      ,
                      {
                        color:
                          parsedTask?.statusId === 'pending'
                            ? 'black'
                            : 'white',
                      },
                    ]}
                  >
                    {'start'}
                  </Text>
                </TouchableOpacity>
              ) : null
            })}
            {newButtons.map((item: any, index: number) => {
              const parseItem =
                typeof item === 'string' ? JSON.parse(item) : item
              return parseItem.statuses.includes(parsedTask?.statusId) ? (
                <TouchableOpacity
                  className="flex flex-row items-center justify-center rounded-full bg-orange-400 p-4 px-20"
                  key={index}
                  disabled={isLoading}
                  onPress={async () => {
                    if (parseItem?.modal) {
                      const modalButtons =
                        typeof parseItem?.modal === 'string'
                          ? JSON.parse(parseItem?.modal)
                          : parseItem?.modal
                      Alert.alert(
                        '',
                        modalButtons?.modalText,
                        modalButtons?.modalButtons.map((items: any) => ({
                          text: items?.label,
                          style: 'default',
                          onPress: () => {
                            if (
                              items?.action.toString().toLowerCase() ===
                              'approve'
                            ) {
                              handleEscalation(parseItem)
                            }
                          },
                        })),
                        {
                          cancelable: true,
                        },
                      )
                    } else {
                      await handleEscalation(parseItem)
                    }
                  }}
                >
                  <Text className="text-white">
                    {isLoading ? (
                      <ActivityIndicator size="large" color="skyblue" />
                    ) : (
                      (parseItem.label ?? 'submit')
                    )}
                  </Text>
                </TouchableOpacity>
              ) : null
            })}
          </View>
        )
    }
  }

  return (
    <ParallaxScrollView>
      <BackButton title={`${parsedTask.taskType} ${parsedTask.taskId}`} />
      <View className="pt-8">
        {!!parsedTask.urgentTask && (
          <View>
            <MaterialCommunityIcons name="flash" size={28} color="red" />
          </View>
        )}
        <View className="mb-4">
          {newTaskDetails.map((item: any, index: number) => {
            const isGroup = item.key === 'groupName'
            const isStatus = item.key === 'statusId'

            let displayValue = parseValueForRender(item.value, item)
            const isCurrency = item.inputType === 'currency'

            if (isStatus) {
              displayValue = parsedStatusLabels[item.value]
            }

            if (isGroup) {
              displayValue = taskGroupLabel
            }

            if (isCurrency) {
              displayValue = displayValue
                ? `${DEFAULT_CURRENCY_SYMBOL} ${displayValue}`
                : ''
            }

            return (
              <View
                key={index}
                className="flex-row flex-wrap gap-6 rounded-md p-4"
                style={[
                  {
                    backgroundColor: index % 2 === 0 ? '#F1FCFF' : 'white',
                  },
                ]}
              >
                <View>
                  <Text>{item.label}</Text>
                </View>
                <View>
                  {item.key.startsWith('doc') && item.value ? (
                    <TouchableOpacity
                      onPress={() =>
                        onClickViewButton(item.value.value ?? item.value)
                      }
                    >
                      <Text>{'show'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text>{displayValue}</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>
        {renderEscalatedTask()}
      </View>
    </ParallaxScrollView>
  )
}

export default TaskDetail
