export const injectField = async ({
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

    const currentField = task.form!.find((item: any) => item.key === fieldKey)

    const optionTypes = [
      FormFieldTypes.RADIO,
      FormFieldTypes.CHECKBOXES,
      FormFieldTypes.DROPDOWN,
    ]

    const isOptionType = optionTypes.includes(currentField?.inputType as any)

    if (isOptionType && !currentField) return cleanedText

    if (isOptionType) {
      formValue = getLabelsFromOptions(currentField!, formValue as any)
    }

    if (formValue == null) return cleanedText

    const isValueBoolean = typeof formValue === 'boolean'
    const isValueNum =
      typeof formValue === 'number' || !Number.isNaN(Number(formValue))
    const isValueArray = Array.isArray(formValue)

    if (isValueBoolean) return text.replace(expression, formValue.toString())

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
