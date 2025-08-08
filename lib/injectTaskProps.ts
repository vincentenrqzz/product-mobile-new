import _ from 'lodash'

export const injectTaskProps = ({
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
