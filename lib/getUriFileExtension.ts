export const getUriFileExtension = (url: string): string => {
  if (!url) return ''

  const parts = url.split('.')
  const lastPart = parts.pop()

  if (!lastPart) return ''

  const fileExtension = lastPart.split('?')[0]
  return fileExtension.toLowerCase()
}
