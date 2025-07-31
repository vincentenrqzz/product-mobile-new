import separatedComma from './separatedComma'

const parseCurrency = ({
  value,
  format,
}: {
  value: string
  format: string
}): any => {
  if (!value) return ''

  switch (format) {
    case '# $':
      return value.toString()
    case '#,##0 $':
      return separatedComma(Math.round(+value))
    case '#,##0.00 $':
      value = Math.round(+value).toFixed(2)
      return separatedComma(value)
    case '#,##0.## $':
      value = (+value).toFixed(2)
      return separatedComma(value)
    default:
      return value.toString()
  }
}

export default parseCurrency
