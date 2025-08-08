import decodeHtmlEntities from '@/lib/decodeHtmlEntities'
import { getImageFromAmazon } from '@/services/api/endpoints/upload'
import { Task } from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { FormFieldTypes, ParsedFormField } from '@/types/form'
import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'

const printIcon = require('../../assets/images/icon.png')

type GroupAttribute = {
  key: string
  value: string
}

type Group = {
  GroupName: string
  Attributes: GroupAttribute[]
}

interface InjectGroupAttributeParams {
  text: string
  groupData: Group[]
  attrKey: string
  attrVal?: string
  taskGroup: string
}

type PrinterButtonProps = {
  onChange: (key: string, value: any, id: any, newFormVal?: any) => any
  item: any
  value: any
  task: Task
  currentFormValues: any
}

type TaskDetail = {
  key: string
  value: string | string[] | { value: string }
}

interface InjectDataParams {
  text: string
  taskDetails: TaskDetail[]
  detailKey: string
  detailValue?: string
}

const PrinterButton = React.forwardRef<any, PrinterButtonProps>(
  ({ onChange, item, value, task, currentFormValues }, ref) => {
    //store
    const { userGroup } = useUserInfoStore()

    //state
    const [getString, setString] = useState('')
    const { taskId } = task
    const { key, label, uniqueId } = item
    let { displayValue, defaultValue } = item
    displayValue = displayValue || decodeHtmlEntities(defaultValue)

    //functions
    const extractBetween = (
      str: string,
      start: string,
      end: string,
    ): string[] => {
      const results: string[] = []
      let currentIndex = 0

      while (true) {
        const startIndex = str.indexOf(start, currentIndex)
        if (startIndex === -1) break

        const endIndex = str.indexOf(end, startIndex + start.length)
        if (endIndex === -1) break

        const match = str.substring(startIndex + start.length, endIndex)
        results.push(match)
        currentIndex = endIndex + end.length
      }

      return results
    }
    // const result = extractBetween.get(displayValue, '{{', '}}')
    const result = extractBetween(displayValue, '{{', '}}')

    const injectTime = (text: string, time?: string) => {
      const timeToPlace = time ?? moment(new Date()).format('DD/MM/YYYY HH:mm')
      return text.replace(/{{global:time}}/g, timeToPlace)
    }

    const injectGroupAttribute = ({
      text,
      groupData,
      attrKey,
      attrVal,
      taskGroup,
    }: InjectGroupAttributeParams) => {
      const expression = new RegExp(`{{global:group.${attrKey}}}`, 'g')

      if (attrVal != null) {
        return text.replace(expression, attrVal)
      }

      const cleanedText = text.replace(expression, '')

      if (!Array.isArray(groupData)) return cleanedText

      const matchGroup = groupData.find(
        (group) => group.GroupName === taskGroup,
      )
      const matchAttribute = matchGroup?.Attributes.find(
        (attr) => attr.key === attrKey,
      )

      // const matchGroup = groupData[0].tenant.find(
      //   group => group.GroupName === taskGroup,
      // );

      if (matchGroup == null) return cleanedText

      if (matchAttribute == null) return cleanedText

      const valueToPlace = matchAttribute.value

      const isValueImage = valueToPlace.toLowerCase().includes('data:image')

      if (isValueImage)
        return text.replace(expression, `<img src='${valueToPlace}' />`)

      return text.replace(expression, valueToPlace)
    }

    const injectData = ({
      text,
      taskDetails,
      detailKey,
      detailValue,
    }: InjectDataParams): string => {
      const placeholderPattern = new RegExp(`{{data:${detailKey}}}`, 'g')

      // Direct override provided
      if (detailValue != null) {
        return text.replace(placeholderPattern, detailValue)
      }

      const matchedDetail = taskDetails.find((item) => item.key === detailKey)
      if (!matchedDetail || matchedDetail.value == null) {
        return text.replace(placeholderPattern, '')
      }

      const { value } = matchedDetail

      if (Array.isArray(value)) {
        return text.replace(placeholderPattern, value.join(', '))
      }

      if (typeof value === 'object' && 'value' in value) {
        return text.replace(placeholderPattern, value.value ?? '')
      }

      return text.replace(placeholderPattern, value)
    }

    const getLabelsFromOptions = (
      currentField: ParsedFormField,
      formValues: string[] | string,
    ): string | string[] => {
      if (!currentField) return ''

      const { inputType } = currentField
      const options = currentField.options!

      const isCheckbox = inputType === FormFieldTypes.CHECKBOXES
      const valueIsArray = Array.isArray(formValues)

      if (isCheckbox && valueIsArray) {
        let temp: string[] = []
        for (var i = 0; i < formValues.length; i++) {
          const val = Object.values(options).find((key) => {
            if (options[formValues[i]] === key) {
              return key
            }
          })

          temp = [...temp, val]
        }
        if (temp.length === 3) {
          temp[0] = formValues[0]
        }
        return temp
      }

      return options![formValues as string] ?? ''
    }

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
      const cleanedText = text.replace(expression, '')

      try {
        if (fieldValue != null) {
          return text.replace(expression, fieldValue)
        }

        let formValue = currentValues[fieldKey]

        const currentField = task.form!.find(
          (item: any) => item.key === fieldKey,
        )

        const optionTypes = [
          FormFieldTypes.RADIO,
          FormFieldTypes.CHECKBOXES,
          FormFieldTypes.DROPDOWN,
        ]

        const isOptionType = optionTypes.includes(
          currentField?.inputType as any,
        )

        if (isOptionType && !currentField) return cleanedText

        if (isOptionType) {
          formValue = getLabelsFromOptions(currentField!, formValue as any)
        }

        if (formValue == null) return cleanedText

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
            return (
              "<img src='" +
              e +
              "' style='border: 1px solid black; width: 400px ; height: 400px; object-fit: cover'/>"
            )
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

        const isSignature = formValue.includes('.png')

        if (isSignature) {
          const fileUri = `${FileSystem.cacheDirectory}${formValue}`

          try {
            const imgBase64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            })

            return text.replace(
              expression,
              `<img src="data:image/png;base64,${imgBase64}" />`,
            )
          } catch (error) {
            console.warn(`Error reading signature image: ${error}`)
            return cleanedText // fallback
          }
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
    const injectTaskProps = ({
      text,
      taskData,
      key,
      value,
    }: {
      text: string
      taskData: any
      key: string
      value?: string
    }) => {
      const expression = new RegExp(`{{task:${key}}}`, 'g')

      if (value != null) return text.replace(expression, value)

      const taskValue = _.get(taskData, key)

      return text.replace(expression, taskValue ?? '')
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
            taskDetails: task.taskDetails,
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
            currentValues: currentFormValues,
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
              const res = await getImageFromAmazon(taskId, item)
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
        const res = await getImageFromAmazon(taskId, val)
        if (res?.presignedUrl) {
          picAmazon.push(res.presignedUrl)
        }
      } catch {
        // Silent fail
      }

      return picAmazon.length > 0 ? picAmazon : []
    }

    // component

    const print = async () => {
      // Add margin to <p> tags
      const replace = getString.replace(/<p>/g, '<p style="margin: 20px 0px">')

      // Create printable HTML with styling
      const htmlContent = `
    <div style="font-size:60px; direction:rtl; line-height:1.5;">
      ${replace}
    </div>
  `

      try {
        // Generate the PDF
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        })

        // Update some state (assuming this is your callback)
        onChange(key, true, uniqueId)

        // Share the PDF (optional)
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri)
        } else {
          console.log('Sharing is not available on this device')
        }
      } catch (error) {
        console.error('Error while printing:', error)
      }
    }

    // mount unmount
    useEffect(() => {
      setData()
    }, [currentFormValues, displayValue])

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#3ABEE0',
          width: 260,
          height: 80,
          borderRadius: 15,
          marginTop: 10,
          flexDirection: 'row',
        }}
        onPress={print}
      >
        <Image
          style={{
            width: 40,
            height: 35,
            marginTop: 18,
            marginLeft: 40,
          }}
          source={printIcon}
        />
        <Text
          style={{
            color: 'white',
            marginTop: 15,
            marginLeft: 30,
            textAlign: 'left',
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    )
  },
)

export default PrinterButton
