import moment from 'moment-timezone'
import parseCurrency from './parseCurrency'

const parseValueForRender = (value: any, taskDetail: any): string => {
  const valueIsNull = value == null
  const valueIsArray = Array.isArray(value)
  const valueIsObject =
    !valueIsNull && !valueIsArray && typeof value === 'object'
  const valueIsBoolean = typeof value === 'boolean'
  const valueIsDate =
    taskDetail?.inputType?.toLowerCase() === 'datetime' ||
    taskDetail?.inputType?.toLowerCase() === 'date'
  const valueIsCurrency = taskDetail?.inputType?.toLowerCase() === 'currency'
  if (valueIsNull) return ''
  if (valueIsArray) return value.join(', ')
  if (valueIsObject) {
    return parseValueForRender(value.value, taskDetail)
  }
  if (valueIsBoolean) return value.toString().toLowerCase()
  if (valueIsDate) {
    const dateString = moment(value).format(
      taskDetail?.format ?? 'DD-MM-YYYY HH:mm',
    )
    if (dateString.toLowerCase() === 'invalid date') {
      return value
    }
    return dateString
  }
  if (valueIsCurrency) {
    const val = parseCurrency({ value, format: taskDetail?.format })
    return val
  }
  return value.toString()
}

export default parseValueForRender
