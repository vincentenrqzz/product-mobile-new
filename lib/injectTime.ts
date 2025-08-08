import moment from 'moment'

export const injectTime = (text: string, time?: string) => {
  const timeToPlace = time ?? moment(new Date()).format('DD/MM/YYYY HH:mm')
  return text.replace(/{{global:time}}/g, timeToPlace)
}
