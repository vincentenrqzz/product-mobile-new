import { Image, ImageBackground } from 'expo-image'
import moment from 'moment'
import mmt from 'moment-timezone'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

// store
import useAuthStore from '@/store/auth'
import { Task } from '@/store/tasks'
import { Form } from '@/types/form'

// utils
import { getUriFileExtension } from '@/lib/getUriFileExtension'

// components
import PrinterButton from '@/components/ui/PrinterButton'
import VideoPlayer from '@/components/ui/VideoPlayer'
import {
  getImageFromAmazon,
  getVideoFromAmazon,
} from '@/services/api/endpoints/upload'
import Markup from './Markup'

// assets
const backgroundImage = require('../../../assets/images/icon.png')
const playIcon = require('../../../assets/images/icon.png')

export const Info = ({
  item,
  accordionForm,
  task,
  getUserGroup,
}: {
  item: any
  accordionForm?: any
  task: Task
  getUserGroup?: any
}) => {
  // store
  const { token } = useAuthStore()

  // state
  const [isSelected, setIsSelected] = useState('')
  const [formValue, setFormValue] = useState(null)

  // memo
  const currentFormData = useMemo(() => {
    return (
      task.form?.reduce((acc: Record<string, any>, field) => {
        if (field.value === '' || field.value == null) return acc
        acc[field.key] = field.value
        return acc
      }, {}) || {}
    )
  }, [task.form])

  // helpers
  const getPic = async (pic: string): Promise<string> => {
    const getPicFromAmazon = await getImageFromAmazon(task.taskId, pic)

    return getDefaultSignature(getPicFromAmazon.presignedUrl)
  }

  const getVideo = async (pic: string): Promise<string> => {
    const getVidFromAmazon = await getVideoFromAmazon(task.taskId, pic)
    return getVidFromAmazon.presignedUrl
  }

  const getBlob = async (fileUri: string): Promise<Response> => {
    const response = await fetch(fileUri)
    return response
  }

  const timeConvert = (secondsInput: string | number): string => {
    const totalSeconds =
      typeof secondsInput === 'string'
        ? parseInt(secondsInput, 10)
        : secondsInput

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours} hours ${minutes} minutes ${seconds} seconds`
  }

  const getDefaultSignature = (val: string): Promise<string> => {
    return new Promise(async (resolve) => {
      const response = await getBlob(val)
      if (response.status !== 200) {
        resolve('')
        return
      }

      const imageBody = await response.blob()
      const fileReaderInstance = new FileReader()
      fileReaderInstance.readAsDataURL(imageBody)

      fileReaderInstance.onload = () => {
        resolve(fileReaderInstance.result as string)
      }
    })
  }

  // form rendering
  const parseFormValue = async (field: any, value?: any) => {
    const { inputType, options, rules } = field
    const finalValue = value ?? field.value

    switch (inputType) {
      case 'text':
      case 'textarea':
      case 'attachButton':
      case 'survey':
        return <Text>{finalValue}</Text>

      case 'assigned':
      case 'dateTimeRegister':
      case 'dateTimePicker':
      case 'datePicker':
      case 'button': {
        let displayValue = moment(finalValue).format('DD.MM.YYYY HH:mm')
        const isDoneButton = rules?.actions?.includes('transmitDone')

        if (displayValue.toLowerCase() === 'invalid date') {
          displayValue = finalValue
        } else {
          displayValue = mmt
            .tz(finalValue, 'Asia/Jerusalem')
            .format('DD.MM.YYYY HH:mm')
        }

        if (isDoneButton) {
          const start = task.form?.find((f) =>
            f.rules?.actions?.includes('startTask'),
          )
          const hasNoStart = !start || !start.value
          const hasNoEnd = finalValue === '' || finalValue == null

          if (hasNoStart || hasNoEnd) return <Text>{displayValue}</Text>

          const startTime = moment(start.value)
          const endTime = moment(finalValue)

          displayValue = timeConvert(endTime.diff(startTime) / 1000)
        }

        return <Text>{displayValue}</Text>
      }

      case 'radios':
      case 'dropdown':
      case 'checkboxes': {
        const valuesArr = [finalValue].flat()
        return (
          <View className="flex flex-col">
            {valuesArr.map((item: string | number) => {
              const optionValue = options?.[item] ?? item
              return <Text key={item}>{optionValue}</Text>
            })}
          </View>
        )
      }

      case 'signature': {
        const imageKey = !field.value ? 'image.png' : field.value
        const picture = await getPic(imageKey)

        return picture ? (
          <Image
            source={{ uri: picture }}
            style={{ height: 100, width: 100 }}
          />
        ) : (
          <ImageBackground source={backgroundImage} />
        )
      }

      case 'cameraButton': {
        const picturesArr = [finalValue].flat()

        const promises = picturesArr.map(async (item: string, idx: number) => {
          const link = await getVideo(item)
          const uriFileExtension = getUriFileExtension(link)

          return (
            <Fragment key={item}>
              {uriFileExtension === 'mp4' ? (
                <View>
                  <VideoPlayer source={link} />
                </View>
              ) : (
                <View className="flex-wrap p-2">
                  <ImageBackground source={backgroundImage}>
                    <Image
                      style={{ width: 100, height: 75 }}
                      source={{ uri: link }}
                    />
                  </ImageBackground>
                </View>
              )}
            </Fragment>
          )
        })

        return await Promise.all(promises)
      }

      case 'droppableAccordion':
        if (!accordionForm) return null
        return await displayObjectAsValue(finalValue, accordionForm)

      case 'markup':
        return <Markup item={field} task={task} getUserGroup={getUserGroup} />

      case 'printButton':
        return (
          <PrinterButton
            item={item}
            onChange={(key, value, id, newFormVal) => null}
            task={task}
            currentFormValues={currentFormData}
          />
        )

      default:
        return null
    }
  }

  const displayObjectAsValue = async (
    objectValue: Record<string, any>,
    accordionForm: Form,
  ) => {
    if (!objectValue) return []

    const fieldMap = accordionForm.formFields.reduce<Record<string, any>>(
      (acc, field) => {
        acc[field.key] = field
        return acc
      },
      {},
    )

    const promises = Object.entries(objectValue)
      .filter(([_, val]) => val !== '' && val != null)
      .map(async ([key, value]) => {
        const fieldData = fieldMap[key]

        const nullTypes = ['markup', 'printButton']
        if (!fieldData || nullTypes.includes(fieldData.inputType)) return null

        const fieldValue = await parseFormValue(fieldData, value)

        return (
          <View key={key}>
            <View>
              <Text>{fieldData.label}</Text>
            </View>
            <View>{fieldValue}</View>
          </View>
        )
      })

    return await Promise.all(promises)
  }

  // const getAllPicture = async (picturesArr: string[]) => {
  //   const getPics = picturesArr.map(async (item, idx) => {
  //     const picture = await getPic(item)
  //     return (
  //       <ImageBackground key={idx} source={backgroundImage}>
  //         <Image source={{ uri: picture }} />
  //       </ImageBackground>
  //     )
  //   })

  //   return await Promise.all(getPics)
  // }

  // mount
  useEffect(() => {
    parseFormValue(item).then((res: any) => {
      setFormValue(res)
    })
  }, [item, accordionForm])

  console.log(`${item.inputType}: ${item?.label}`)
  // render
  return (
    <View className="mb-10 flex-row  flex-wrap gap-6 rounded-md bg-[#F1FCFF] p-4 ">
      <Text>{item?.label}</Text>

      {item.inputType === 'cameraButton' || item.inputType === 'signature' ? (
        <View>
          {formValue ? (
            <View
              style={{
                flexGrow: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
                display: 'flex',
              }}
            >
              {formValue}
            </View>
          ) : (
            <ActivityIndicator size="large" color="skyblue" />
          )}
        </View>
      ) : (
        <View>{formValue}</View>
      )}
    </View>
  )
}

export default Info
