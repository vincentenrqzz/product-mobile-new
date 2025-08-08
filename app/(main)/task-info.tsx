import Info from '@/components/features/task-info/Info'
import Markup from '@/components/features/task-info/Markup'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import BackButton from '@/components/ui/BackButton'
import { checkConditions } from '@/lib/checkConditions'
import useFormsStore from '@/store/forms'
import { Task } from '@/store/tasks'
import { Form } from '@/types/form'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

const TaskInfo = () => {
  //builtin
  const router = useRouter()
  const params = useLocalSearchParams()
  const { task } = params
  //stores
  const { forms } = useFormsStore()
  //parsing params data
  const parsedTask: Task = typeof task === 'string' && JSON.parse(task)

  //state
  let checker = false

  //memo
  const formMap: Record<string, Form> = useMemo(() => {
    return forms.reduce(
      (acc: any, item) => {
        acc[item._id] = item

        return acc
      },
      {} as Record<string, Form>,
    )
  }, [forms])

  const currentFormValues = useMemo(() => {
    return parsedTask.form.reduce((acc: any, item) => {
      const { key, value } = item
      acc[key] = value
      return acc
    }, {})
  }, [parsedTask.form])

  const taskDetails = useMemo(() => {
    const details: Record<string, any> = {}

    parsedTask.taskDetails.forEach((item) => {
      const key = `td-${item.key}`
      const value =
        item.key === 'assignedTo'
          ? (item?.value?.value ?? null)
          : (item.value ?? null)
      details[key] = value
    })

    return details
  }, [parsedTask.taskDetails])

  const filteredForm =
    parsedTask.form?.filter((item) => {
      return checkConditions(
        currentFormValues,
        item.conditions,
        'and',
        taskDetails,
      )
    }) ?? []

  //functions
  const getTaskDetails = async (taskObject: Task) => {
    let newObject: any = {}
    taskObject.taskDetails.forEach((item) => {
      if (item.key === 'assignedTo') {
        const key = 'td-' + item.key
        const value = item.value !== undefined ? item?.value?.value : null
        newObject[key] = value
      } else {
        const key = 'td-' + item.key
        const value = item.value !== undefined ? item.value : null
        newObject[key] = value
      }
    })
    return newObject
  }

  //components
  const renderFormsInfo = (item: any, index: any) => {
    const { inputType, key, options } = item

    if ((item.value == null || item.value == '') && inputType !== 'markup') {
      return
    }

    // dont include markup
    switch (inputType) {
      case 'dateTimeRegister':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'radios':
        checker = key !== 'continueExecution' ? true : false
        return <Info item={item} task={parsedTask} key={index} />
      case 'dropdown':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'checkboxes':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'text':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'textarea':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'cameraButton':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      // case 'videoButton':
      //   checker = true;
      //   return <Info itemData={item} wholeTask={wholeTask} />;
      case 'signature':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'survey':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />
      case 'droppableAccordion':
        checker = true

        const accordionForm = formMap[options?.formId]

        return (
          <Info
            itemData={item}
            accordionForm={accordionForm}
            wholeTask={wholeTask}
          />
        )

      case 'printButton':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />

      case 'button':
        checker = true
        return <Info item={item} task={parsedTask} key={index} />

      case 'markup':
        checker = true

        return (
          <View className="p-8">
            <Markup
              item={item}
              task={parsedTask}
              getUserGroup={null}
              values={currentFormValues}
              key={index}
            />
          </View>
        )

      case 'attachButton':
        checker = true
        return <Info item={item} task={parsedTask} />

      case 'assigned':
        checker = true
        return <Info item={item} task={parsedTask} />
    }
  }

  const components = filteredForm?.map(renderFormsInfo)

  return (
    <ParallaxScrollView>
      <BackButton title={`${parsedTask.taskType} ${parsedTask.taskId}`} />

      <View className="pt-8">
        {checker ? components : <Text>{'noFormElements'}</Text>}
      </View>
    </ParallaxScrollView>
  )
}

export default TaskInfo
