export const extractBetween = (
  str: string,
  start: string,
  end: string,
): string[] => {
  const results: string[] = []
  let currentIndex = 0

  while (true) {
    const startIndex = str.indexOf(start, currentIndex)
    if (startIndex === -1) break

    const endIndex = str.indexOf(end, startIndex + start.length)
    if (endIndex === -1) break

    const match = str.substring(startIndex + start.length, endIndex)
    results.push(match)
    currentIndex = endIndex + end.length
  }

  return results
}
