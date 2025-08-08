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

export const injectGroupAttribute = ({
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

  const matchGroup = groupData.find((group) => group.GroupName === taskGroup)
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
