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
export const injectData = ({
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
