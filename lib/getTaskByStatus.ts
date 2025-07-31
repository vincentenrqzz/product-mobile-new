const getTaskByStatus = (
  pendingItems: any[],
  taskId: number,
  status: 'pending' | 'not-pending',
) => {
  if (pendingItems && pendingItems.length > 0) {
    const response = pendingItems.filter((item: any) => {
      const { partialStatus, task } = item

      // Check if the status contains 'not-', then remove it and adjust the condition
      if (status.startsWith('not-')) {
        const actualStatus = status.replace('not-', '') // Remove 'not-' from status
        return partialStatus !== actualStatus && task.taskId === taskId
      }

      // Otherwise, check for exact match
      return partialStatus === status && task.taskId === taskId
    })

    if (response.length === 0) {
      return null
    }
    return response[0]
  }

  return null
}

export default getTaskByStatus
