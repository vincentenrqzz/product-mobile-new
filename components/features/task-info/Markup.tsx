import { extractBetween } from '@/lib/extractBetween'
import { getBlob } from '@/lib/getBlob'
import { injectData } from '@/lib/injectData'
import { injectGroupAttribute } from '@/lib/injectGroupAttr'
import { injectTaskProps } from '@/lib/injectTaskProps'
import { injectTime } from '@/lib/injectTime'
import { getImageFromAmazon } from '@/services/api/endpoints/upload'
import { Task } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import RenderHtml from 'react-native-render-html'

type MarkupProps = {
  item: any
  task: Task
  getUserGroup?: any
  values?: any
}

const Markup = React.forwardRef<any, MarkupProps>(
  ({ item, task, getUserGroup, values }, ref) => {
    //store
    const { userGroup } = useUserInfoStore()

    //state
    const [getString, setString] = useState('')
    let { displayValue, defaultValue, value } = item
    displayValue =
      displayValue != ''
        ? displayValue
        : defaultValue != null || defaultValue != undefined
          ? defaultValue
          : value != null || value != undefined
            ? value
            : ''
    const result = extractBetween(displayValue, '{{', '}}')

    //functions
    const injectField = async ({
      text,
      currentValues,
      fieldKey,
      fieldValue,
    }: {
      text: string
      currentValues: Record<string, any>
      fieldKey: string
      fieldValue?: string
    }) => {
      const expression = new RegExp(`{{field:${fieldKey}}}`, 'g')

      if (fieldValue != null) {
        return text.replace(expression, fieldValue)
      }

      const formValue = currentValues[fieldKey]

      const cleanedText = text.replace(expression, '')

      if (formValue == null) return cleanedText

      try {
        const isValueBoolean = typeof formValue === 'boolean'
        const isValueNum =
          typeof formValue === 'number' || !Number.isNaN(Number(formValue))
        const isValueArray = Array.isArray(formValue)

        if (isValueBoolean)
          return text.replace(expression, formValue.toString())

        const isCameraButton = formValue
          .toString()
          .includes('rn_image_picker_lib_temp')

        if (isCameraButton) {
          const image = await imgState(formValue)
          const res = image.map((e) => {
            return `<img src='${e}'style='border: 1px solid black; width: 50px; height: 100px' />`
          })
          return text.replace(expression, res.join(''))
        }

        if (isValueArray) {
          const joined = formValue.join(', ')

          return text.replace(expression, joined)
        }

        if (isValueNum) {
          return text.replace(expression, formValue.toString())
        }

        const isSignature = formValue.includes('file://')

        if (isSignature) {
          const img = await getDefaultSignature(formValue)
          return text.replace(expression, `<img src='${img}' />`)
        }

        const valueAsDate = moment(
          formValue,
          [
            'DD-MM-YYYY',
            'MM-DD-YYYY',
            'x',
            'X',
            'YYYY-DD-MM',
            'YYYY-MM-DD',
            moment.ISO_8601,
            moment.HTML5_FMT.DATETIME_LOCAL,
            moment.HTML5_FMT.DATETIME_LOCAL_MS,
            moment.HTML5_FMT.DATETIME_LOCAL_SECONDS,
          ],
          true,
        )

        if (valueAsDate.isValid())
          return text.replace(expression, valueAsDate.format('DD/MM/YYYY'))

        return text.replace(expression, formValue)
      } catch (error) {
        return cleanedText
      }
    }

    const setData = async () => {
      let resultString = displayValue

      for (const template of result) {
        const [type, fieldKey] = template.split(':')

        const toAddTime = type === 'global' && fieldKey === 'time'
        const toAddData = type === 'data'
        const toAddField = type === 'field'
        const toAddGroup = type === 'global' && fieldKey.startsWith('group.')
        const toAddTaskProps = type === 'task'

        if (toAddTime) {
          resultString = injectTime(resultString)
        } else if (toAddData) {
          resultString = injectData({
            text: resultString,
            taskDetails: task?.taskDetails,
            detailKey: fieldKey,
          })
        } else if (toAddGroup) {
          const cleanedKey = fieldKey.split('group.')[1]

          resultString = injectGroupAttribute({
            text: resultString,
            groupData: userGroup ?? [],
            attrKey: cleanedKey,
            taskGroup: task.groupName,
          })
        } else if (toAddField) {
          resultString = await injectField({
            text: resultString,
            currentValues: values,
            fieldKey,
          })
        } else if (toAddTaskProps) {
          resultString = injectTaskProps({
            text: resultString,
            taskData: task,
            key: fieldKey,
          })
        } else {
          const expression = new RegExp(`{{${template}}}`, 'g')
          resultString = resultString.replace(expression, '')
        }
      }

      setString(resultString)
    }
    const imgState = async (val: string | string[]): Promise<string[]> => {
      const picAmazon: string[] = []

      if (Array.isArray(val)) {
        const results = await Promise.all(
          val.map(async (item) => {
            try {
              const res = await getImageFromAmazon(task.taskId, item)
              return res?.presignedUrl || null
            } catch {
              return null
            }
          }),
        )

        const filtered = results.filter((url): url is string => Boolean(url))
        return filtered.length > 0 ? filtered : []
      }

      try {
        const res = await getImageFromAmazon(task.taskId, val)
        if (res?.presignedUrl) {
          picAmazon.push(res.presignedUrl)
        }
      } catch {
        // Silent fail
      }

      return picAmazon.length > 0 ? picAmazon : []
    }

    const getDefaultSignature = (val: string) => {
      return new Promise(async (resolve, reject) => {
        const imageBody = await getBlob(val)
        const fileReaderInstance = new FileReader()
        fileReaderInstance.readAsDataURL(imageBody)

        fileReaderInstance.onload = () => {
          resolve(fileReaderInstance.result)
        }
      })
    }

    // effects
    useEffect(() => {
      setData()
    }, [values])
    const source = {
      html: `<div style="textAlign: left">${getString}</div>`,
    }

    return (
      <View style={styles.container} ref={ref}>
        <RenderHtml source={source} />
      </View>
    )
  },
)

export default Markup
const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  btn: {
    backgroundColor: '#3ABEE0',
    width: 260,
    height: 80,
    borderRadius: 15,
    marginTop: 10,
    flexDirection: 'row',
  },
  text: {
    color: 'white',
    marginTop: 15,
    marginLeft: 30,
    textAlign: 'right',
  },
  ico: {
    width: 40,
    height: 35,
    marginTop: 18,
    marginLeft: 40,
  },
})
