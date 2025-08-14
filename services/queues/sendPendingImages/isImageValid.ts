export const isImageNameValid = (
  imageName: string,
  validNames: Set<string>,
): boolean => {
  // Direct match

  if (validNames.has(imageName)) {
    return true
  }

  // Try matching without path
  const cleanImageName = imageName.split('/').pop() || imageName
  if (validNames.has(cleanImageName)) {
    return true
  }

  // Try matching without extension
  const nameWithoutExt = cleanImageName.replace(/\.[^/.]+$/, '')
  for (const validName of validNames) {
    const validNameWithoutExt = validName.replace(/\.[^/.]+$/, '')
    if (nameWithoutExt === validNameWithoutExt) {
      return true
    }
  }

  return false
}
