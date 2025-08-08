export const getBlob = async (fileUri: string) => {
  const resp = await fetch(fileUri)
  const imageBody = await resp.blob()
  return imageBody
}
