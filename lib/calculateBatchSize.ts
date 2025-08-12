import * as FileSystem from 'expo-file-system'

export const calculateBatchSize = async () => {
  try {
    const freeMemory = await FileSystem.getFreeDiskStorageAsync()
    const minFreeMemoryThreshold = 200 * 1024 * 1024 // 200MB
    const baseBatchSize = 3
    const maxBatchSize = 7

    const batchSize = Math.max(
      baseBatchSize,
      Math.min(Math.floor(freeMemory / minFreeMemoryThreshold), maxBatchSize),
    )

    return batchSize
  } catch (error) {
    console.warn(`calculateBatchSize: Error, using default size 3 - ${error}`)
    return 3
  }
}
